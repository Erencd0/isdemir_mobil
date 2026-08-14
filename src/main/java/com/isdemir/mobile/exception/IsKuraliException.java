package com.isdemir.mobile.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Auth disindaki beklenen hatalar: zaman sirasi bozuk, dokum bulunamadi,
 * pasif operator secildi gibi. AuthException ile ayni sekle sahip,
 * GlobalHataYakalayici ikisini de ayni HataCevap govdesine cevirir.
 */
@Getter
public class IsKuraliException extends RuntimeException {

    private final HttpStatus durum;
    private final String hata;

    public IsKuraliException(HttpStatus durum, String hata, String mesaj) {
        super(mesaj);
        this.durum = durum;
        this.hata = hata;
    }
}
