package com.isdemir.mobile.dto;

import com.isdemir.mobile.entity.Dokum;

import java.time.LocalDateTime;

/**
 * Bir dokumun cevap govdesi. Liste, detay ve olusturma ayni govdeyi doner -
 * dokum zaten 13 alanlik kucuk bir kayit, ayrica bir "ozet" govdesi tutmuyoruz.
 */
public record DokumCevap(
        Long dokumId,
        Long dokumNo,
        Long konverterNo,
        LocalDateTime hurdaSarjBaslama,
        LocalDateTime hurdaSarjBitis,
        LocalDateTime anaUflemeBaslama,
        LocalDateTime anaUflemeBitis,
        LocalDateTime dokumZamani,
        Double shdSicaklik,
        Double dokumSicaklik,
        String lansSkalDurum,
        Long kullaniciId,
        Long operatorId,
        String operatorAdSoyad
) {

    public static DokumCevap of(Dokum d) {
        return new DokumCevap(
                d.getDokumId(),
                d.getDokumNo(),
                d.getKonverterNo(),
                d.getHurdaSarjBaslama(),
                d.getHurdaSarjBitis(),
                d.getAnaUflemeBaslama(),
                d.getAnaUflemeBitis(),
                d.getDokumZamani(),
                d.getShdSicaklik(),
                d.getDokumSicaklik(),
                d.getLansSkalDurum(),
                d.getKullaniciId(),
                d.getOperator() == null ? null : d.getOperator().getOperatorId(),
                d.getOperator() == null ? null : d.getOperator().adSoyad());
    }
}
