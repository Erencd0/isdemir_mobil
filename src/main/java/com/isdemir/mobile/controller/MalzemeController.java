package com.isdemir.mobile.controller;

import com.isdemir.mobile.dto.MalzemeKullanimCevap;
import com.isdemir.mobile.dto.MalzemeKullanimIstek;
import com.isdemir.mobile.entity.MalzemeTanim;
import com.isdemir.mobile.security.JwtFiltresi;
import com.isdemir.mobile.service.MalzemeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Malzeme tanimlari ve dokumdeki malzeme kullanimlari.
 *
 * Hepsi korumali: JwtFiltresi /api/auth disindaki her istekte
 * Authorization: Bearer <accessToken> bekler.
 */
@RestController
@RequestMapping("/api/dokum")
@RequiredArgsConstructor
public class MalzemeController {

    private final MalzemeService malzemeService;

    /**
     * Malzeme secim listesini doldurur.
     * Ornek: GET /api/dokum/malzemeler?tur=KONVKATKI
     */
    @GetMapping("/malzemeler")
    public List<MalzemeTanim> malzemeler(@RequestParam String tur) {
        return malzemeService.tanimlar(tur);
    }

    /** Bir dokume girilmis malzeme kullanimlari, malzeme adlariyla birlikte. */
    @GetMapping("/{dokumId}/malzemeler")
    public List<MalzemeKullanimCevap> dokumMalzemeleri(@PathVariable Long dokumId) {
        return malzemeService.dokumKullanimlari(dokumId);
    }

    /**
     * Dokume malzeme kullanimi ekler, olusan kaydi doner.
     * Genel_kullanici salt okunurdur, bu uca erisemez.
     */
    @PostMapping("/malzeme")
    @ResponseStatus(HttpStatus.CREATED)
    public MalzemeKullanimCevap malzemeEkle(@RequestAttribute(JwtFiltresi.ROL) String rol,
                                            @Valid @RequestBody MalzemeKullanimIstek istek) {
        return malzemeService.kullanimEkle(rol, istek);
    }

    /** Yanlis girilen kullanim kaydini siler. Govde yok, 204 doner. */
    @DeleteMapping("/malzeme/{malzemeKullanimId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void malzemeSil(@RequestAttribute(JwtFiltresi.ROL) String rol,
                           @PathVariable Long malzemeKullanimId) {
        malzemeService.kullanimSil(rol, malzemeKullanimId);
    }
}
