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
 * Supabase'deki operator tablosu. Dokumu yapan vardiya operatoru.
 * Isten ayrilan operator silinmez, akifPasif false yapilir; boylece eski
 * dokumlerin operatoru gorunmeye devam eder ama yeni dokumde secilemez.
 */
@Entity
@Table(name = "operator")
@Getter
@Setter
public class Operator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "operator_adi", nullable = false)
    private String operatorAdi;

    @Column(name = "operator_soyadi")
    private String operatorSoyadi;

    /** Kolon adindaki "akif" yazimi DB'de boyle, degistirmiyoruz. */
    @Column(name = "akif_pasif")
    private Boolean akifPasif;

    public String adSoyad() {
        return operatorSoyadi == null ? operatorAdi : operatorAdi + " " + operatorSoyadi;
    }
}
