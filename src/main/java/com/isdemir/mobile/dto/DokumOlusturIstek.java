package com.isdemir.mobile.dto;

import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

/**
 * Yeni dokum kaydi. Butun alanlar istege baglidir.
 *
 * Operator dokumu vardiya basinda bos bir kayit olarak acabilir, bilgileri
 * surec ilerledikce guncelleme ucundan doldurur. Bu yuzden hicbir alan
 * zorunlu degil; gonderilen alanlar ise dogrulanir (zaman sirasi, cakisma,
 * pozitif sicaklik, aktif operator).
 *
 * Gonderilmeyen iki alan bilerek yok:
 *   dokumNo      -> 7 haneli numara backend'de uretilir
 *   konverterNo  -> giristeki kv rolunden gelir, istemci secemez
 */
public record DokumOlusturIstek(
        LocalDateTime hurdaSarjBaslama,
        LocalDateTime hurdaSarjBitis,
        LocalDateTime anaUflemeBaslama,
        LocalDateTime anaUflemeBitis,
        LocalDateTime dokumZamani,

        @Positive(message = "SHD sıcaklığı sıfırdan büyük olmalı")
        Double shdSicaklik,

        @Positive(message = "Döküm sıcaklığı sıfırdan büyük olmalı")
        Double dokumSicaklik,

        String lansSkalDurum,
        Long operatorId
) {
}
