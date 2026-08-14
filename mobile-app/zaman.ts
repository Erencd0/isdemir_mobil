/**
 * Zaman bicimlendirme yardimcilari.
 *
 * Backend LocalDateTime'i "2026-08-14T06:52:00" seklinde, saat dilimi bilgisi
 * OLMADAN gonderiyor. Bu yuzden new Date(iso) kullanmiyoruz: cihazin saat
 * dilimine gore kaydirir ve saatler yanlis gorunur. Metni dogrudan parcaliyoruz.
 */

type Parcalar = { yil: number; ay: number; gun: number; saat: number; dakika: number };

function coz(iso?: string | null): Parcalar | null {
  if (!iso || iso.length < 16) return null;
  return {
    yil: Number(iso.slice(0, 4)),
    ay: Number(iso.slice(5, 7)),
    gun: Number(iso.slice(8, 10)),
    saat: Number(iso.slice(11, 13)),
    dakika: Number(iso.slice(14, 16)),
  };
}

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const ikiHane = (n: number) => (n < 10 ? '0' + n : String(n));

/** "06:52" */
export function saat(iso?: string | null): string {
  const p = coz(iso);
  return p ? ikiHane(p.saat) + ':' + ikiHane(p.dakika) : '--:--';
}

/** "14 Ağu" */
export function tarih(iso?: string | null): string {
  const p = coz(iso);
  return p ? p.gun + ' ' + AYLAR[p.ay - 1] : '-';
}

/** "14 Ağu 06:52" */
export function tarihSaat(iso?: string | null): string {
  const p = coz(iso);
  return p ? tarih(iso) + ' ' + saat(iso) : '-';
}

/** Iki zaman arasindaki fark, dakika olarak. Cozulemezse 0. */
export function dakikaFarki(bas?: string | null, bit?: string | null): number {
  const a = coz(bas);
  const b = coz(bit);
  if (!a || !b) return 0;

  // Ayni gun icinde kalmayan dokumler icin gun farkini da hesaba kat
  const gunFarki = Date.UTC(b.yil, b.ay - 1, b.gun) - Date.UTC(a.yil, a.ay - 1, a.gun);
  const gunDakikasi = gunFarki / 60000;
  return gunDakikasi + (b.saat * 60 + b.dakika) - (a.saat * 60 + a.dakika);
}

/** 75 -> "1sa 15dk", 43 -> "43 dk" */
export function sureMetni(dakika: number): string {
  if (dakika <= 0) return '-';
  if (dakika < 60) return dakika + ' dk';
  const sa = Math.floor(dakika / 60);
  const dk = dakika % 60;
  return dk === 0 ? sa + ' sa' : sa + 'sa ' + dk + 'dk';
}

/** Tarih secicilerden gelen Date'i backend'in bekledigi metne cevirir. */
export function isoYaz(d: Date): string {
  return (
    d.getFullYear() +
    '-' + ikiHane(d.getMonth() + 1) +
    '-' + ikiHane(d.getDate()) +
    'T' + ikiHane(d.getHours()) +
    ':' + ikiHane(d.getMinutes()) +
    ':00'
  );
}

/** Bugun mu? Liste basliklarinda "Bugün" yazabilmek icin. */
export function bugunMu(iso?: string | null): boolean {
  const p = coz(iso);
  if (!p) return false;
  const s = new Date();
  return p.yil === s.getFullYear() && p.ay === s.getMonth() + 1 && p.gun === s.getDate();
}
