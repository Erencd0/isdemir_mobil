package com.isdemir.mobile.dto;

import java.util.List;

/**
 * Kullanici adi + parola dogrulandiginda donen cevap.
 * Frontend bu listeyle rol combobox'ini doldurup acar.
 */
public record RollerCevap(String kullaniciAdi, List<String> roller) {
}
