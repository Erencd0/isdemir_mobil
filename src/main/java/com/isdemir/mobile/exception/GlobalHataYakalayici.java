package com.isdemir.mobile.exception;

import com.isdemir.mobile.dto.HataCevap;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
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

    /** Zaman sirasi, pasif operator, yetkisiz konverter gibi is kurallari. */
    @ExceptionHandler(IsKuraliException.class)
    public ResponseEntity<HataCevap> isKuraliHatasi(IsKuraliException e) {
        return ResponseEntity.status(e.getDurum())
                .body(new HataCevap(e.getHata(), e.getMessage()));
    }

    /**
     * DB kisiti takildi. Pratikte tek sebebi var: iki dokum ayni anda
     * kaydedilip ayni dokum_no'yu almaya calisti. Tekrar denenince duzelir.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<HataCevap> veriCakismasi(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new HataCevap("KAYIT_CAKISMASI", "Kayıt çakıştı, lütfen tekrar deneyin"));
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
