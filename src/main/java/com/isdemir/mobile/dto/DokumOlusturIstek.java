package com.isdemir.mobile.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

/**
 * Yeni dokum kaydi. Kayit surec bittikten sonra girildigi icin
 * bes zamanin besi de zorunlu.
 *
 * Gonderilmeyen iki alan bilerek yok:
 *   dokumNo      -> 7 haneli numara backend'de uretilir
 *   konverterNo  -> giristeki kv rolunden gelir, istemci secemez
 */
public record DokumOlusturIstek(

        @NotNull(message = "Hurda şarj başlama zamanı boş olamaz")
        LocalDateTime hurdaSarjBaslama,

        @NotNull(message = "Hurda şarj bitiş zamanı boş olamaz")
        LocalDateTime hurdaSarjBitis,

        @NotNull(message = "Ana üfleme başlama zamanı boş olamaz")
        LocalDateTime anaUflemeBaslama,

        @NotNull(message = "Ana üfleme bitiş zamanı boş olamaz")
        LocalDateTime anaUflemeBitis,

        @NotNull(message = "Döküm zamanı boş olamaz")
        LocalDateTime dokumZamani,

        @NotNull(message = "SHD sıcaklığı boş olamaz")
        @Positive(message = "SHD sıcaklığı sıfırdan büyük olmalı")
        Double shdSicaklik,

        @NotNull(message = "Döküm sıcaklığı boş olamaz")
        @Positive(message = "Döküm sıcaklığı sıfırdan büyük olmalı")
        Double dokumSicaklik,

        String lansSkalDurum,

        @NotNull(message = "Operatör seçilmeli")
        Long operatorId
) {
}
