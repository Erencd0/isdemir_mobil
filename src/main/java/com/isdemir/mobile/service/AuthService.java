package com.isdemir.mobile.service;

import com.isdemir.mobile.dto.LoginIstek;
import com.isdemir.mobile.dto.RollerCevap;
import com.isdemir.mobile.dto.TokenCevap;
import com.isdemir.mobile.entity.Kullanici;
import com.isdemir.mobile.entity.RefreshToken;
import com.isdemir.mobile.exception.AuthException;
import com.isdemir.mobile.repository.KullaniciRepository;
import com.isdemir.mobile.repository.RefreshTokenRepository;
import com.isdemir.mobile.security.JwtYonetici;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final KullaniciRepository kullaniciRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtYonetici jwtYonetici;
    private final long refreshGecerlilikGun;

    public AuthService(KullaniciRepository kullaniciRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtYonetici jwtYonetici,
                       @Value("${jwt.refresh-gecerlilik-gun}") long refreshGecerlilikGun) {
        this.kullaniciRepository = kullaniciRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtYonetici = jwtYonetici;
        this.refreshGecerlilikGun = refreshGecerlilikGun;
    }

    /**
     * Madde 1: kullanici adi + parola dogru mu?
     * Dogruysa kullanicinin erisebildigi rollerin listesini doner, token uretmez.
     */
    @Transactional(readOnly = true)
    public RollerCevap rolleriGetir(LoginIstek istek) {
        Kullanici kullanici = kimlikDogrula(istek.kullaniciAdi(), istek.parola());
        return new RollerCevap(kullanici.getKullaniciAdi(), rolleriAyikla(kullanici.getRol()));
    }

    /**
     * Madde 2: rol secildikten sonraki asil giris.
     * Parola tekrar dogrulanir - frontend'in ikinci istegine de guvenmiyoruz.
     */
    @Transactional
    public TokenCevap girisYap(LoginIstek istek) {
        Kullanici kullanici = kimlikDogrula(istek.kullaniciAdi(), istek.parola());
        String secilenRol = istek.rol().trim();

        if (!rolleriAyikla(kullanici.getRol()).contains(secilenRol)) {
            throw new AuthException(
                    HttpStatus.FORBIDDEN,
                    "YETKISIZ_ROL",
                    "Bu role erişim yetkiniz yok");
        }

        return tokenUret(kullanici, secilenRol);
    }

    /**
     * Madde 4: access token'in suresi dolunca cagrilir, kullanici gormez.
     * Eski refresh token pasife dusurulur ve yenisi verilir; boylece calinan
     * bir refresh token sonsuza kadar kullanilamaz.
     */
    @Transactional
    public TokenCevap yenile(String refreshToken) {
        RefreshToken kayit = refreshTokenRepository.findByRefreshToken(refreshToken)
                .filter(k -> Boolean.TRUE.equals(k.getAktifPasif()))
                .filter(k -> k.getBitisZamani() != null
                        && k.getBitisZamani().isAfter(LocalDateTime.now()))
                .orElseThrow(this::gecersizRefresh);

        Kullanici kullanici = kullaniciRepository.findById(kayit.getKullaniciId())
                .orElseThrow(this::gecersizRefresh);

        kayit.setAktifPasif(false);

        // Rol artik hicbir yerde tutulmuyor, cevapta da bos gider.
        // Frontend giriste aldigi rolu kendi saklar.
        return tokenUret(kullanici, null);
    }

    private AuthException gecersizRefresh() {
        return new AuthException(
                HttpStatus.UNAUTHORIZED,
                "GECERSIZ_REFRESH",
                "Oturum geçersiz, lütfen tekrar giriş yapın");
    }

    /**
     * Madde 3: cikis. Oturumun refresh token'ini pasife ceker.
     *
     * Token zaten yoksa ya da baskasina aitse sessizce hicbir sey yapmaz ve
     * yine 204 doner: cikis istegi tekrar gonderilse de sonuc ayni olmali,
     * ayrica "bu token var mi" sorusuna cevap vermis olmayalim.
     *
     * @param kullaniciId access token'dan gelir, istek govdesinden degil.
     */
    @Transactional
    public void cikisYap(Long kullaniciId, String refreshToken) {
        refreshTokenRepository.findByRefreshToken(refreshToken)
                .filter(kayit -> kullaniciId.equals(kayit.getKullaniciId()))
                .ifPresent(kayit -> kayit.setAktifPasif(false));
    }

    /**
     * Access token + refresh token uretir, refresh'i DB'ye yazar.
     *
     * @param rol sadece cevap govdesinde geri yansitilir, token'in icine GIRMEZ.
     *            Giriste secilen roldur; refresh'te null gelir cunku o bilgi
     *            hicbir yerde saklanmiyor.
     */
    TokenCevap tokenUret(Kullanici kullanici, String rol) {
        RefreshToken kayit = new RefreshToken();
        kayit.setKullaniciId(kullanici.getId());
        kayit.setRefreshToken(UUID.randomUUID().toString());
        kayit.setOlusturulmaZamani(LocalDateTime.now());
        kayit.setBitisZamani(LocalDateTime.now().plusDays(refreshGecerlilikGun));
        kayit.setAktifPasif(true);
        refreshTokenRepository.save(kayit);

        return new TokenCevap(
                jwtYonetici.uret(kullanici),
                kayit.getRefreshToken(),
                "Bearer",
                jwtYonetici.getGecerlilikSn(),
                new TokenCevap.KullaniciBilgi(kullanici.getId(), kullanici.getKullaniciAdi(), rol));
    }

    /**
     * Kullaniciyi bulur ve parolayi karsilastirir.
     * Parola duz metin tutuluyor, hash yok - staj projesi karari.
     * Kullanici yok ile parola yanlis ayni hatayi doner, hangisinin
     * yanlis oldugunu disariya sizdirmayalim.
     */
    Kullanici kimlikDogrula(String kullaniciAdi, String parola) {
        return kullaniciRepository.findByKullaniciAdi(kullaniciAdi)
                .filter(k -> parola.equals(k.getParola()))
                .orElseThrow(() -> new AuthException(
                        HttpStatus.UNAUTHORIZED,
                        "GECERSIZ_KIMLIK",
                        "Kullanıcı adı veya parola hatalı"));
    }

    /**
     * DB'de roller tek kolonda virgulle ayrilmis durur: "kv1,kv3".
     * Bunu listeye cevirir. Kolon bossa bos liste doner.
     */
    static List<String> rolleriAyikla(String rolKolonu) {
        if (rolKolonu == null || rolKolonu.isBlank()) {
            return List.of();
        }
        return Arrays.stream(rolKolonu.split(","))
                .map(String::trim)
                .filter(rol -> !rol.isEmpty())
                .toList();
    }
}
