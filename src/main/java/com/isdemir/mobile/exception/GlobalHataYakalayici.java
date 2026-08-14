package com.isdemir.mobile.exception;

import com.isdemir.mobile.dto.HataCevap;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Tum hatalari tek bir formata cevirir: { "hata": "...", "mesaj": "..." }
 */
@RestControllerAdvice
public class GlobalHataYakalayici {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<HataCevap> authHatasi(AuthException e) {
        return ResponseEntity.status(e.getDurum())
                .body(new HataCevap(e.getHata(), e.getMessage()));
    }

    /** @Valid takildi: bos veya eksik alan. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<HataCevap> dogrulamaHatasi(MethodArgumentNotValidException e) {
        String mesaj = e.getBindingResult().getFieldErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .findFirst()
                .orElse("Eksik veya hatalı alan");
        return ResponseEntity.badRequest()
                .body(new HataCevap("DOGRULAMA_HATASI", mesaj));
    }

    /** Govde hic gelmedi ya da bozuk JSON. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<HataCevap> okunamayanGovde(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
                .body(new HataCevap("DOGRULAMA_HATASI", "İstek gövdesi okunamadı"));
    }
}
