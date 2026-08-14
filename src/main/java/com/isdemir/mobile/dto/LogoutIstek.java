package com.isdemir.mobile.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cikis istegi. Access token header'da gelir, kapatilacak oturum ise bu refresh token'dir.
 */
public record LogoutIstek(

        @NotBlank(message = "Refresh token boş olamaz")
        String refreshToken
) {
}
