package com.isdemir.mobile.dto;

/**
 * Basarili girisin cevabi. Refresh sonrasinda da birebir ayni govde doner.
 * gecerlilikSn -> accessToken kac saniye sonra olecek (frontend buna gore yeniler)
 */
public record TokenCevap(
        String accessToken,
        String refreshToken,
        String tokenTipi,
        long gecerlilikSn,
        KullaniciBilgi kullanici
) {

    /** Girise ait ozet bilgi. rol, kullanicinin sectigi TEK roldur. */
    public record KullaniciBilgi(Long id, String kullaniciAdi, String rol) {
    }
}
