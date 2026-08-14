package com.isdemir.mobile.dto;

import com.isdemir.mobile.entity.Operator;

/**
 * Dokum ekranindaki operator listesini dolduran satir.
 *
 * aktif alani arayuz icin: pasif operatorler yeni dokumde secilemez, ama
 * gecmis dokumlerde adlari gorunmeye devam eder. Arayuz bu bayrakla
 * aktifleri yesil, pasifleri kirmizi gosterir.
 */
public record OperatorCevap(Long operatorId, String adSoyad, boolean aktif) {

    public static OperatorCevap of(Operator operator) {
        return new OperatorCevap(
                operator.getOperatorId(),
                operator.adSoyad(),
                Boolean.TRUE.equals(operator.getAkifPasif()));
    }
}
