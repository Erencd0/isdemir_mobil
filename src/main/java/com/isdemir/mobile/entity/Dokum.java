package com.isdemir.mobile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Supabase'deki dokum_tablosu. Bir konverterde yapilan tek bir dokumun kaydi.
 *
 * Surecin sirasi sabittir ve kayit bu sirayla okunur:
 *   hurda sarj baslama -> hurda sarj bitis -> ana ufleme baslama
 *   -> ana ufleme bitis -> dokum zamani
 * Sira kontrolu DokumService'te yapilir.
 *
 * Kolon adlarindaki yazim hatalari (harda_sarj_bitis, ana_ufeleme_baslama,
 * kullanci_id, oprator_id) DB'de boyle olusturuldu; alan adlari duzgun,
 * eslesme @Column ile yapiliyor.
 */
@Entity
@Table(name = "dokum_tablosu")
@Getter
@Setter
public class Dokum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dokum_id")
    private Long dokumId;

    /** 7 haneli dokum numarasi, uretimi DokumService.dokumNoUret'te. */
    @Column(name = "dokum_no", nullable = false, unique = true)
    private Long dokumNo;

    /** Hangi konverter: 1, 2 veya 3. Giristeki kv rolunden gelir. */
    @Column(name = "konverter_no")
    private Long konverterNo;

    @Column(name = "hurda_sarj_baslama")
    private LocalDateTime hurdaSarjBaslama;

    @Column(name = "harda_sarj_bitis")
    private LocalDateTime hurdaSarjBitis;

    @Column(name = "ana_ufeleme_baslama")
    private LocalDateTime anaUflemeBaslama;

    @Column(name = "ana_ufleme_bitis")
    private LocalDateTime anaUflemeBitis;

    @Column(name = "dokum_zamani")
    private LocalDateTime dokumZamani;

    /** Sivi ham demir sicakligi (C). */
    @Column(name = "shd_sicaklik")
    private Double shdSicaklik;

    @Column(name = "dokum_sicaklik")
    private Double dokumSicaklik;

    @Column(name = "lans_skal_durum")
    private String lansSkalDurum;

    /** Kaydi giren kullanici. Kullanici entity'sine iliski kurmuyoruz (bkz. IS_BOLUMU.md). */
    @Column(name = "kullanci_id")
    private Long kullaniciId;

    /**
     * Operator ayni dilimde oldugu icin iliski kuruluyor; cevapta operator
     * adi da donuyor, ayri sorgu gerekmesin.
     *
     * ponytail: EAGER, listede operator basina ek sorgu aciyor. Operator sayisi
     * bir elin parmagi kadar oldugu icin ayni oturumda tekrar sorgulanmiyor;
     * liste yavaslarsa DokumRepository'de "join fetch d.operator" yeter.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "oprator_id")
    private Operator operator;
}
