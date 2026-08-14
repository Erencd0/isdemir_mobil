package com.isdemir.mobile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Supabase'deki refresh_token_tablosu.
 * Her giris bir satir acar; cikista veya yenilemede aktifPasif false yapilir.
 */
@Entity
@Table(name = "refresh_token_tablosu")
@Getter
@Setter
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_id")
    private Long refreshId;

    @Column(name = "kullanici_id")
    private Long kullaniciId;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "olusturulma_zamani")
    private LocalDateTime olusturulmaZamani;

    @Column(name = "bitis_zamani")
    private LocalDateTime bitisZamani;

    @Column(name = "aktif_pasif")
    private Boolean aktifPasif;
}
