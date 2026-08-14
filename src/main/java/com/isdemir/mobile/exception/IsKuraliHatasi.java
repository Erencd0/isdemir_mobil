package com.isdemir.mobile.exception;

import lombok.Getter;

/**
 * Is kurali ihlalleri (eksik secim, olmayan kayit, gecersiz tur).
 * Auth disindaki beklenen hatalar icin; GlobalHataYakalayici bunu
 * { "hata": "...", "mesaj": "..." } govdesine 400 ile cevirir.
 */
@Getter
public class IsKuraliHatasi extends RuntimeException {

    private final String hata;

    public IsKuraliHatasi(String hata, String mesaj) {
        super(mesaj);
        this.hata = hata;
    }
}
