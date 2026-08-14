package com.isdemir.mobile.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

/**
 * Dokume malzeme eklerken gelen istek.
 *
 * verilisTarihi opsiyoneldir: gonderilmezse sunucu saati kullanilir.
 * Kaydi kimin girdigi tutulmuyor - malzeme_kullanim tablosunda operator kolonu yok.
 */
public record MalzemeKullanimIstek(
        @NotNull(message = "Döküm seçiniz")
        Long dokumId,

        @NotNull(message = "Malzeme seçiniz")
        Long malzemeId,

        @NotNull(message = "Miktar giriniz")
        @Positive(message = "Miktar sıfırdan büyük olmalıdır")
        Double miktar,

        LocalDateTime verilisTarihi
) {
}
