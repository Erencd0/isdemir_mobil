package com.isdemir.mobile.dto;

/**
 * Tum hatalarda donen ortak govde: { "hata": "GECERSIZ_KIMLIK", "mesaj": "..." }
 * hata  -> frontend'in switch'leyecegi sabit kod
 * mesaj -> kullaniciya gosterilecek Turkce metin
 */
public record HataCevap(String hata, String mesaj) {
}
