package com.isdemir.mobile.controller;

import com.isdemir.mobile.dto.LoginIstek;
import com.isdemir.mobile.dto.LogoutIstek;
import com.isdemir.mobile.dto.RefreshIstek;
import com.isdemir.mobile.dto.TokenCevap;
import com.isdemir.mobile.security.JwtFiltresi;
import com.isdemir.mobile.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Login ekraninin tek adresi, iki asamada da buraya gelinir:
     *   rol yok  -> butona basildi, rol listesi doner ve combobox acilir
     *   rol var  -> "giris yap"a basildi, token doner
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginIstek istek) {
        return ResponseEntity.ok(istek.rolSecilmis()
                ? authService.girisYap(istek)
                : authService.rolleriGetir(istek));
    }

    /**
     * Access token'in suresi dolunca frontend arka planda cagirir, kullanici gormez.
     * Token istemez - zaten olu token yuzunden buraya geliniyor.
     * Cevap login ile birebir ayni govde: rol de dahil, oturumun rolu korunur.
     */
    @PostMapping("/refresh")
    public TokenCevap refresh(@Valid @RequestBody RefreshIstek istek) {
        return authService.yenile(istek.refreshToken());
    }

    /**
     * Cikis. Access token header'da gelir, JwtFiltresi dogrular;
     * kullaniciId istek govdesinden degil token'dan okunur.
     * Govde yok, her durumda 204 doner.
     */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestAttribute(JwtFiltresi.KULLANICI_ID) Long kullaniciId,
                       @Valid @RequestBody LogoutIstek istek) {
        authService.cikisYap(kullaniciId, istek.refreshToken());
    }
}
