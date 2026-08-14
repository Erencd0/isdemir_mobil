package com.isdemir.mobile.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Access token'in suresi dolunca frontend'in arka planda attigi istek.
 * Rol sorulmaz - token kullaniciya bagli, role degil.
 */
public record RefreshIstek(

        @NotBlank(message = "Refresh token boş olamaz")
        String refreshToken
) {
}
