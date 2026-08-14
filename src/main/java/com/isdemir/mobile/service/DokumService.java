package com.isdemir.mobile.service;

import com.isdemir.mobile.dto.DokumCevap;
import com.isdemir.mobile.dto.DokumOlusturIstek;
import com.isdemir.mobile.entity.Dokum;
import com.isdemir.mobile.entity.Operator;
import com.isdemir.mobile.exception.IsKuraliException;
import com.isdemir.mobile.repository.DokumRepository;
import com.isdemir.mobile.repository.OperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DokumService {

    /** Konverter kisiti olmayan, butun dokumleri goren rol. */
    private static final String GENEL_KULLANICI = "Genel_kullanici";

    /** Dokum numarasi hep 6 ile baslar: 6 3 00001 -> konverter 3'un ilk dokumu. */
    private static final long DOKUM_NO_ONEKI = 6_000_000L;
    private static final long KONVERTER_BASAMAGI = 100_000L;

    private final DokumRepository dokumRepository;
    private final OperatorRepository operatorRepository;

    /** kv rolleri kendi konverterini, Genel_kullanici hepsini gorur. */
    @Transactional(readOnly = true)
    public List<DokumCevap> listele(String rol) {
        Long konverterNo = konverterNoBul(rol);
        List<Dokum> dokumler = konverterNo == null
                ? dokumRepository.findAllByOrderByDokumZamaniDesc()
                : dokumRepository.findByKonverterNoOrderByDokumZamaniDesc(konverterNo);
        return dokumler.stream().map(DokumCevap::of).toList();
    }

    @Transactional(readOnly = true)
    public DokumCevap detay(String rol, Long dokumId) {
        Long konverterNo = konverterNoBul(rol);

        Dokum dokum = dokumRepository.findById(dokumId)
                .orElseThrow(() -> new IsKuraliException(
                        HttpStatus.NOT_FOUND, "DOKUM_BULUNAMADI", "Döküm bulunamadı"));

        if (konverterNo != null && !konverterNo.equals(dokum.getKonverterNo())) {
            throw new IsKuraliException(HttpStatus.FORBIDDEN, "YETKISIZ_KONVERTER",
                    "Bu döküm başka bir konvertere ait");
        }
        return DokumCevap.of(dokum);
    }

    /**
     * Yeni dokum. Konverter ve dokum numarasi istemciden gelmez:
     * konverter oturumun rolunden, numara o konverterin son numarasindan uretilir.
     */
    @Transactional
    public DokumCevap olustur(Long kullaniciId, String rol, DokumOlusturIstek istek) {
        Long konverterNo = konverterNoBul(rol);
        if (konverterNo == null) {
            throw new IsKuraliException(HttpStatus.FORBIDDEN, "KONVERTER_YOK",
                    "Döküm kaydı için kv1, kv2 veya kv3 rolüyle giriş yapılmalı");
        }

        zamanSirasiKontrol(istek);

        if (dokumRepository.cakisanDokumVarMi(konverterNo, istek.hurdaSarjBaslama(), istek.dokumZamani())) {
            throw new IsKuraliException(HttpStatus.CONFLICT, "DOKUM_CAKISMASI",
                    "Bu konverterde aynı zaman aralığında başka bir döküm var. "
                            + "Yeni döküm, önceki dökümün döküm zamanından önce başlayamaz");
        }

        Dokum dokum = new Dokum();
        dokum.setDokumNo(dokumNoUret(konverterNo, dokumRepository.enBuyukDokumNo(konverterNo)));
        dokum.setKonverterNo(konverterNo);
        dokum.setHurdaSarjBaslama(istek.hurdaSarjBaslama());
        dokum.setHurdaSarjBitis(istek.hurdaSarjBitis());
        dokum.setAnaUflemeBaslama(istek.anaUflemeBaslama());
        dokum.setAnaUflemeBitis(istek.anaUflemeBitis());
        dokum.setDokumZamani(istek.dokumZamani());
        dokum.setShdSicaklik(istek.shdSicaklik());
        dokum.setDokumSicaklik(istek.dokumSicaklik());
        dokum.setLansSkalDurum(istek.lansSkalDurum());
        dokum.setKullaniciId(kullaniciId);
        dokum.setOperator(aktifOperator(istek.operatorId()));

        return DokumCevap.of(dokumRepository.save(dokum));
    }

    private Operator aktifOperator(Long operatorId) {
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IsKuraliException(
                        HttpStatus.BAD_REQUEST, "OPERATOR_BULUNAMADI", "Operatör bulunamadı"));

        if (!Boolean.TRUE.equals(operator.getAkifPasif())) {
            throw new IsKuraliException(HttpStatus.BAD_REQUEST, "OPERATOR_PASIF",
                    "Pasif operatör ile döküm kaydedilemez");
        }
        return operator;
    }

    /**
     * Surecin adimlari birbirini takip eder; hicbir adim kendinden oncekinden
     * erken olamaz. Esitlige izin var - bir adim digerinin bittigi anda baslayabilir.
     */
    static void zamanSirasiKontrol(DokumOlusturIstek i) {
        siraKontrol(i.hurdaSarjBaslama(), i.hurdaSarjBitis(),
                "Hurda şarj bitişi, başlangıcından önce olamaz");
        siraKontrol(i.hurdaSarjBitis(), i.anaUflemeBaslama(),
                "Ana üfleme, hurda şarj bitmeden başlayamaz");
        siraKontrol(i.anaUflemeBaslama(), i.anaUflemeBitis(),
                "Ana üfleme bitişi, başlangıcından önce olamaz");
        siraKontrol(i.anaUflemeBitis(), i.dokumZamani(),
                "Döküm, ana üfleme bitmeden yapılamaz");
    }

    private static void siraKontrol(LocalDateTime onceki, LocalDateTime sonraki, String mesaj) {
        if (onceki.isAfter(sonraki)) {
            throw new IsKuraliException(HttpStatus.BAD_REQUEST, "ZAMAN_SIRASI", mesaj);
        }
    }

    /**
     * 7 haneli dokum numarasi: 6 + konverter no + 5 haneli sira.
     * Konverter 3'un ilk dokumu 6300001, sonraki 6300002.
     *
     * @param enBuyuk o konverterde verilmis en buyuk numara, ilk dokumde null
     */
    static long dokumNoUret(long konverterNo, Long enBuyuk) {
        long taban = DOKUM_NO_ONEKI + konverterNo * KONVERTER_BASAMAGI;
        long yeni = enBuyuk == null ? taban + 1 : enBuyuk + 1;

        // Sira 99999'u gecerse numara yan konverterin araligina tasar.
        if (yeni >= taban + KONVERTER_BASAMAGI) {
            throw new IsKuraliException(HttpStatus.CONFLICT, "DOKUM_NO_DOLDU",
                    "Konverter " + konverterNo + " için döküm numarası aralığı doldu");
        }
        return yeni;
    }

    /**
     * Oturumun rolunden konverter numarasi. Dokum tablosunda rol kolonu yok,
     * konverter_no var; "kv3 sadece kendi dokumlerini gorur" pratikte
     * konverter_no = 3 filtresidir.
     *
     * @return Genel_kullanici icin null - konverter kisiti yok, hepsini gorur
     */
    static Long konverterNoBul(String rol) {
        if (GENEL_KULLANICI.equals(rol)) {
            return null;
        }
        if (rol != null && rol.length() > 2 && rol.regionMatches(true, 0, "kv", 0, 2)) {
            try {
                return Long.parseLong(rol.substring(2));
            } catch (NumberFormatException yoksay) {
                // asagidaki hataya dusuyoruz
            }
        }
        throw new IsKuraliException(HttpStatus.FORBIDDEN, "GECERSIZ_ROL",
                "Oturum rolü tanınmıyor, lütfen tekrar giriş yapın");
    }
}
