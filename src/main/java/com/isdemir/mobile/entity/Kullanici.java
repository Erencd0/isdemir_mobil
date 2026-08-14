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
 * Supabase'deki "Kullanici" tablosu.
 * Tablo adi veritabaninda tirnakli ve buyuk harfli olusturuldu, bu yuzden
 * @Table icinde de tirnakli yaziliyor; tirnak olmazsa Hibernate "kullanici"
 * arar ve tabloyu bulamaz.
 */
@Entity
@Table(name = "\"Kullanici\"")
@Getter
@Setter
public class Kullanici {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "kullanici_adi", nullable = false, unique = true)
    private String kullaniciAdi;

    /** Duz metin tutuluyor, hash yok. Staj projesi karari. */
    @Column(name = "parola")
    private String parola;

    /** Birden fazla rol virgulle ayrilmis tek kolonda durur: "kv1,kv3" */
    @Column(name = "rol")
    private String rol;
}
