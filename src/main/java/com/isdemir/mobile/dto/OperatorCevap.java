package com.isdemir.mobile.dto;

import com.isdemir.mobile.entity.Operator;

/** Dokum ekranindaki operator combobox'ini dolduran satir. */
public record OperatorCevap(Long operatorId, String adSoyad) {

    public static OperatorCevap of(Operator operator) {
        return new OperatorCevap(operator.getOperatorId(), operator.adSoyad());
    }
}
