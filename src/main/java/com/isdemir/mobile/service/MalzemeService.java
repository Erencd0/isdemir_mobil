package com.isdemir.mobile.service;

import com.isdemir.mobile.dto.MalzemeKullanimCevap;
import com.isdemir.mobile.dto.MalzemeKullanimIstek;
import com.isdemir.mobile.entity.MalzemeKullanim;
import com.isdemir.mobile.entity.MalzemeTanim;
import com.isdemir.mobile.exception.IsKuraliHatasi;
import com.isdemir.mobile.repository.MalzemeKullanimRepository;
import com.isdemir.mobile.repository.MalzemeTanimRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Malzeme tanimlari ve dokumdeki malzeme kullanimlari.
 *
 * "Tanim"   -> sistemde kayitli malzeme katalogu, salt okunur (ekran listeler).
 * "Kullanim" -> bir dokume "su malzemeden su kadar verildi" kaydi, eklenip silinir.
 */
@Service
@RequiredArgsConstructor
public class MalzemeService {

    /** Veritabaninda malzeme_turu kolonunun aldigi degerler. */
    private static final Set<String> GECERLI_TURLER = Set.of("KONVKATKI", "POTAKATKI", "HURDAKATKI");

    private final MalzemeTanimRepository malzemeTanimRepository;
    private final MalzemeKullanimRepository malzemeKullanimRepository;

    /** Verilen turdeki malzeme tanimlari - ekrandaki malzeme secim listesini doldurur. */
    public List<MalzemeTanim> tanimlar(String tur) {
        if (tur == null || tur.isBlank()) {
            throw new IsKuraliHatasi("DOGRULAMA_HATASI",
                    "Malzeme türü seçiniz (KONVKATKI / POTAKATKI / HURDAKATKI)");
        }

        String buyukTur = tur.trim().toUpperCase();
        if (!GECERLI_TURLER.contains(buyukTur)) {
            throw new IsKuraliHatasi("GECERSIZ_TUR",
                    "Geçersiz malzeme türü: " + tur + ". Beklenen: KONVKATKI, POTAKATKI veya HURDAKATKI");
        }

        return malzemeTanimRepository.findByMalzemeTuruOrderByMalzemeAdiAsc(buyukTur);
    }

    /** Bir dokume girilmis tum malzeme kullanimlari, malzeme adiyla birlikte. */
    public List<MalzemeKullanimCevap> dokumKullanimlari(Long dokumId) {
        return malzemeKullanimRepository.dokumKullanimlari(dokumId);
    }

    /**
     * Dokume malzeme kullanimi ekler.
     *
     * Malzemenin varligi burada kontrol ediliyor ki kullaniciya anlamli mesaj
     * donebilelim. Dokumun varligini veritabanindaki yabanci anahtar zorluyor;
     * olmayan bir dokum id'si gelirse asagida yakalanip mesaja cevriliyor.
     */
    @Transactional
    public MalzemeKullanimCevap kullanimEkle(MalzemeKullanimIstek istek) {
        MalzemeTanim tanim = malzemeTanimRepository.findById(istek.malzemeId())
                .orElseThrow(() -> new IsKuraliHatasi("MALZEME_BULUNAMADI",
                        "Seçilen malzeme bulunamadı: " + istek.malzemeId()));

        MalzemeKullanim kullanim = new MalzemeKullanim();
        kullanim.setDokumId(istek.dokumId());
        kullanim.setMalzemeId(istek.malzemeId());
        kullanim.setMiktar(istek.miktar());
        kullanim.setMalzemeVerilisTarihi(
                istek.verilisTarihi() != null ? istek.verilisTarihi() : LocalDateTime.now());

        MalzemeKullanim kayit;
        try {
            kayit = malzemeKullanimRepository.saveAndFlush(kullanim);
        } catch (DataIntegrityViolationException e) {
            // Tek kalan ihtimal dokum_id yabanci anahtari - malzemeyi yukarida dogruladik
            throw new IsKuraliHatasi("DOKUM_BULUNAMADI",
                    "Belirtilen döküm bulunamadı: " + istek.dokumId());
        }

        return new MalzemeKullanimCevap(
                kayit.getMalzemeKullanimId(),
                kayit.getDokumId(),
                kayit.getMalzemeId(),
                tanim.getMalzemeAdi(),
                tanim.getMalzemeTuru(),
                kayit.getMiktar(),
                kayit.getMalzemeVerilisTarihi());
    }

    /** Yanlis girilen bir kullanim kaydini siler. */
    @Transactional
    public void kullanimSil(Long malzemeKullanimId) {
        if (!malzemeKullanimRepository.existsById(malzemeKullanimId)) {
            throw new IsKuraliHatasi("KAYIT_BULUNAMADI",
                    "Silinecek malzeme kaydı bulunamadı: " + malzemeKullanimId);
        }
        malzemeKullanimRepository.deleteById(malzemeKullanimId);
    }
}
