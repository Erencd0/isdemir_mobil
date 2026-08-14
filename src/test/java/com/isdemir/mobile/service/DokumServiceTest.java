package com.isdemir.mobile.service;

import com.isdemir.mobile.dto.DokumOlusturIstek;
import com.isdemir.mobile.exception.IsKuraliException;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * DB'siz kontrol: dokum numarasi uretimi, zaman sirasi ve rol -> konverter esleme.
 * Uc kural da saf fonksiyon oldugu icin Spring context'i gerekmiyor.
 */
class DokumServiceTest {

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 8, 14, 8, 0);

    /** Adimlar sirayla dakika dakika: 0 -> 10 -> 20 -> 40 -> 45 */
    private static DokumOlusturIstek istek(int hurdaBas, int hurdaBit, int uflemeBas,
                                           int uflemeBit, int dokum) {
        return new DokumOlusturIstek(
                T0.plusMinutes(hurdaBas), T0.plusMinutes(hurdaBit),
                T0.plusMinutes(uflemeBas), T0.plusMinutes(uflemeBit), T0.plusMinutes(dokum),
                1350.0, 1680.0, "normal", 1L);
    }

    @Test
    void dokumNoKonverterAraligindaArtar() {
        assertEquals(6_300_001L, DokumService.dokumNoUret(3, null));   // kv3'un ilk dokumu
        assertEquals(6_300_002L, DokumService.dokumNoUret(3, 6_300_001L));
        assertEquals(6_200_001L, DokumService.dokumNoUret(2, null));   // kv2 kendi araliginda
        assertThrows(IsKuraliException.class, () -> DokumService.dokumNoUret(3, 6_399_999L));
    }

    @Test
    void zamanlarSirayla() {
        DokumService.zamanSirasiKontrol(istek(0, 10, 20, 40, 45));
        DokumService.zamanSirasiKontrol(istek(0, 10, 10, 40, 40));    // esitlik serbest
    }

    @Test
    void bozukSiraReddedilir() {
        assertThrows(IsKuraliException.class, () -> DokumService.zamanSirasiKontrol(
                istek(10, 5, 20, 40, 45)));   // hurda sarj bitisi baslangictan once
        assertThrows(IsKuraliException.class, () -> DokumService.zamanSirasiKontrol(
                istek(0, 10, 5, 40, 45)));    // ufleme, hurda sarj bitmeden basladi
        assertThrows(IsKuraliException.class, () -> DokumService.zamanSirasiKontrol(
                istek(0, 10, 20, 40, 35)));   // dokum, ufleme bitmeden yapildi
    }

    @Test
    void rolKonvertereCevrilir() {
        assertEquals(1L, DokumService.konverterNoBul("kv1"));
        assertEquals(3L, DokumService.konverterNoBul("kv3"));
        assertNull(DokumService.konverterNoBul("Genel_kullanici"));   // kisit yok, hepsini gorur
        assertThrows(IsKuraliException.class, () -> DokumService.konverterNoBul("mudur"));
    }
}
