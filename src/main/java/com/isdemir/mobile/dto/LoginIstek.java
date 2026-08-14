package com.isdemir.mobile.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Login ekranindan gelen istek. Tek adres iki isi de yapar:
 *   rol bos  -> kullanici adi + parola dogrulanir, rol listesi doner (Madde 1)
 *   rol dolu -> secilen rol dogrulanir, token uretilir (Madde 2)
 * Bu yuzden rol zorunlu degil.
 */
public record LoginIstek(

        @NotBlank(message = "Kullanıcı adı boş olamaz")
        String kullaniciAdi,

        @NotBlank(message = "Parola boş olamaz")
        String parola,

        String rol
) {

    /** Kullanici combobox'tan bir rol secmis mi? */
    public boolean rolSecilmis() {
        return rol != null && !rol.isBlank();
    }
}
