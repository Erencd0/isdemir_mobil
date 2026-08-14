package com.isdemir.mobile.controller;

import com.isdemir.mobile.dto.DokumCevap;
import com.isdemir.mobile.dto.DokumOlusturIstek;
import com.isdemir.mobile.security.JwtFiltresi;
import com.isdemir.mobile.service.DokumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

/**
 * Dokum kayitlari. Her uc adres de access token ister (JwtFiltresi).
 * Rol istek govdesinden degil token'dan okunur - hangi konverterin
 * dokumlerinin gorulecegini istemci secemez.
 */
@RestController
@RequestMapping("/api/dokumler")
@RequiredArgsConstructor
public class DokumController {

    private final DokumService dokumService;

    /** Rolun konverterindeki dokumler, yeniden eskiye. Genel_kullanici hepsini alir. */
    @GetMapping
    public List<DokumCevap> listele(@RequestAttribute(JwtFiltresi.ROL) String rol) {
        return dokumService.listele(rol);
    }

    @GetMapping("/{dokumId}")
    public DokumCevap detay(@RequestAttribute(JwtFiltresi.ROL) String rol,
                            @PathVariable Long dokumId) {
        return dokumService.detay(rol, dokumId);
    }

    /** Yeni dokum. Dokum numarasi ve konverter backend'de belirlenir. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DokumCevap olustur(@RequestAttribute(JwtFiltresi.KULLANICI_ID) Long kullaniciId,
                              @RequestAttribute(JwtFiltresi.ROL) String rol,
                              @Valid @RequestBody DokumOlusturIstek istek) {
        return dokumService.olustur(kullaniciId, rol, istek);
    }

    /**
     * Mevcut dokumu gunceller. Govde olusturmayla ayni;
     * dokum numarasi ve konverter degismez.
     */
    @PutMapping("/{dokumId}")
    public DokumCevap guncelle(@RequestAttribute(JwtFiltresi.ROL) String rol,
                               @PathVariable Long dokumId,
                               @Valid @RequestBody DokumOlusturIstek istek) {
        return dokumService.guncelle(rol, dokumId, istek);
    }

    /** Dokum siler. Yalnizca o konverterin en son dokumu silinebilir. */
    @DeleteMapping("/{dokumId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sil(@RequestAttribute(JwtFiltresi.ROL) String rol,
                    @PathVariable Long dokumId) {
        dokumService.sil(rol, dokumId);
    }
}
