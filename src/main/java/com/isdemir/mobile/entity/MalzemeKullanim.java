package com.isdemir.mobile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Bir dokumde hangi malzemeden ne kadar kullanildigini tutar.
 *
 * Veritabaninda iki yabanci anahtar var:
 *   dokum_id   -> dokum_tablosu(dokum_id)
 *   malzeme_id -> "malzeme_Tanim"(malzeme_id)
 * Olmayan bir dokum ya da malzeme id'si gonderilirse kayit veritabani
 * seviyesinde reddedilir.
 */
@Entity
@Table(name = "malzeme_kullanim")
@Getter
@Setter
public class MalzemeKullanim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "malzeme_kullanim_id")
    private Long malzemeKullanimId;

    @Column(name = "dokum_id", nullable = false)
    private Long dokumId;

    @Column(name = "malzeme_id")
    private Long malzemeId;

    /** Birim kolonu tabloda yok; miktar isletmenin standart birimiyle (kg) tutuluyor. */
    @Column(name = "miktar")
    private Double miktar;

    @Column(name = "malzeme_verilis_tarihi")
    private LocalDateTime malzemeVerilisTarihi;
}
