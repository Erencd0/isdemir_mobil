package com.isdemir.mobile.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Auth akisindaki beklenen hatalar (yanlis parola, yetkisiz rol, olu refresh token).
 * Firlatildiginda GlobalHataYakalayici bunu HataCevap govdesine cevirir.
 */
@Getter
public class AuthException extends RuntimeException {

    private final HttpStatus durum;
    private final String hata;

    public AuthException(HttpStatus durum, String hata, String mesaj) {
        super(mesaj);
        this.durum = durum;
        this.hata = hata;
    }
}
