package com.isdemir.mobile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Supabase'deki "malzeme_Tanim" tablosu - sistemde tanimli malzemelerin katalogu.
 *
 * Tablo adi veritabaninda tirnakli ve buyuk "T" ile olusturuldu, bu yuzden
 * {@code @Table} icinde de tirnakli yaziliyor; tirnak olmazsa Hibernate
 * "malzeme_tanim" arar ve tabloyu bulamaz. (bkz. Kullanici entity'si)
 */
@Entity
@Table(name = "\"malzeme_Tanim\"")
@Getter
@Setter
public class MalzemeTanim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "malzeme_id")
    private Long malzemeId;

    /** Isletmenin kendi malzeme kodu - id'den farkli, kullaniciya gosterilen numara. */
    @Column(name = "malzeme_kodu")
    private Long malzemeKodu;

    /**
     * Malzemenin nerede kullanildigi: KONVKATKI / POTAKATKI / HURDAKATKI.
     * Ekran bu alana gore filtreleyip kullaniciya sadece ilgili malzemeleri gosterir.
     */
    @Column(name = "malzeme_turu")
    private String malzemeTuru;

    @Column(name = "malzeme_adi")
    private String malzemeAdi;
}
