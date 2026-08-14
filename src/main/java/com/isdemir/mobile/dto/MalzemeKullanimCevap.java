package com.isdemir.mobile.dto;

import java.time.LocalDateTime;

/**
 * Bir dokumdeki tek bir malzeme kullanim satiri.
 *
 * Ham entity yerine bunu donuyoruz cunku ekranin malzeme ADINA ihtiyaci var;
 * sadece malzeme_id donsek frontend her satir icin ikinci bir istek atmak
 * zorunda kalirdi.
 */
public record MalzemeKullanimCevap(
        Long malzemeKullanimId,
        Long dokumId,
        Long malzemeId,
        String malzemeAdi,
        String malzemeTuru,
        Double miktar,
        LocalDateTime verilisTarihi
) {
}
