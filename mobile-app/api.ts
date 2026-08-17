/**
 * Backend (Spring Boot) ile konusan tek yer.
 *
 * Kontrat: src/main/java/com/isdemir/mobile/controller/AuthController.java
 * Giris tek adrese gider, iki asamada da ayni endpoint kullanilir:
 *   rol GONDERILMEZ -> kullanici adi + parola dogrulanir, rol listesi doner
 *   rol GONDERILIR  -> secilen rol dogrulanir, token doner
 */
import { NativeModules, Platform } from 'react-native';

/**
 * Backend adresi calistigin ortama gore degisir.
 *
 * Gercek telefonda (Expo Go) localhost telefonun kendisidir, 10.0.2.2 ise sadece
 * Android emulatorunde anlamlidir - ikisi de bilgisayara ulasmaz. Metro paketi
 * telefona zaten bilgisayarin LAN IP'sinden geldigi icin backend adresini oradan
 * turetiyoruz; boylece IP degisince elle guncelleme gerekmiyor.
 * Telefon ve bilgisayar ayni wifi'da olmali.
 */
const kaynak: any = NativeModules.SourceCode;
// Eski mimaride sabitler modulun uzerine yayiliyor, yeni mimaride getConstants() altinda.
const paketAdresi: string | undefined = kaynak?.scriptURL ?? kaynak?.getConstants?.().scriptURL;
const metroHost = paketAdresi?.split('://')[1]?.split(/[:/]/)[0];

export const SUNUCU_ADRESI =
  metroHost && metroHost !== 'localhost'
    ? `http://${metroHost}:8080`
    : (Platform.select({
        android: 'http://10.0.2.2:8080',
        default: 'http://localhost:8080',
      }) as string);

/**
 * DEMO MODU
 *
 * Acikken sunucuya hic istek gitmez, girilen her kullanici adi/parola kabul edilir.
 * Backend calismiyorken ekrani denemek icin. Gercek backend ile test ederken false birakin.
 */
export const DEMO_MOD = false;

/** Demo modda gercek istek hissi vermek icin kisa bekleme. */
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

/** Giris sonrasi ana ekrana tasinan oturum bilgisi. */
export type Oturum = {
  kullaniciAdi: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
};

/** 1. asama cevabi: kimlik dogrulandi, secilebilecek roller geldi. */
export type RollerCevabi = {
  kullaniciAdi: string;
  roller: string[];
};

/** 2. asama cevabi: giris tamam, tokenler geldi. */
export type TokenCevabi = {
  accessToken: string;
  refreshToken: string;
  tokenTipi: string;
  /** accessToken kac saniye sonra olecek */
  gecerlilikSn: number;
  kullanici: { id: number; kullaniciAdi: string; rol: string };
};

/**
 * Cevabi cozer. Backend hatalarda { hata, mesaj } donuyor;
 * kullaniciya "mesaj" alanini gosteriyoruz.
 */
async function cevabiCoz(res: Response) {
  const govde = await res.text();

  if (!res.ok) {
    try {
      const json = JSON.parse(govde);
      throw new Error(json.mesaj || json.hata || 'İşlem başarısız');
    } catch (e) {
      // JSON degilse ham metni goster
      if (e instanceof SyntaxError) {
        throw new Error(govde || 'Sunucuya ulaşılamadı (' + res.status + ')');
      }
      throw e;
    }
  }

  return govde ? JSON.parse(govde) : null;
}

// ---------------------------------------------------------------------------
// Oturum tokeni
// ---------------------------------------------------------------------------

/**
 * Giris disindaki tum uclar Authorization basligi bekliyor.
 * Token'i modul icinde tutuyoruz ki her ekran tek tek tasimak zorunda kalmasin;
 * giriste ayarlanir, cikista temizlenir.
 *
 * TODO: Uygulama kapanip acildiginda oturum kaybolmasin diye
 * expo-secure-store'a yazilmali.
 */
let oturumTokeni: string | null = null;

export function tokenAyarla(token: string | null) {
  oturumTokeni = token;
}

/** Korumali uclara istek atar, Authorization basligini ekler. */
async function istek(yol: string, secenekler: RequestInit = {}) {
  const basliklar: Record<string, string> = {
    ...((secenekler.headers as Record<string, string>) ?? {}),
  };
  if (oturumTokeni) {
    basliklar.Authorization = 'Bearer ' + oturumTokeni;
  }
  if (secenekler.body) {
    basliklar['Content-Type'] = 'application/json';
  }

  const res = await fetch(SUNUCU_ADRESI + yol, { ...secenekler, headers: basliklar });
  return cevabiCoz(res);
}

/**
 * 1. asama: kullanici adi + parolayi dogrular, tanimli rolleri getirir.
 * Rol gonderilmedigi icin backend rol listesi doner.
 */
export async function kimlikKontrol(govde: {
  kullaniciAdi: string;
  parola: string;
}): Promise<RollerCevabi> {
  if (DEMO_MOD) {
    await bekle(700);
    return { kullaniciAdi: govde.kullaniciAdi, roller: ['KV1', 'KV2', 'KV3'] };
  }

  const res = await fetch(SUNUCU_ADRESI + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
  });
  return cevabiCoz(res);
}

/**
 * 2. asama: secilen rol ile giris yapar, token ciftini doner.
 * Ayni adres, tek fark govdede rol da var.
 */
export async function girisYap(govde: {
  kullaniciAdi: string;
  parola: string;
  rol: string;
}): Promise<TokenCevabi> {
  if (DEMO_MOD) {
    await bekle(700);
    return {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      tokenTipi: 'Bearer',
      gecerlilikSn: 900,
      kullanici: { id: 0, kullaniciAdi: govde.kullaniciAdi, rol: govde.rol },
    };
  }

  const res = await fetch(SUNUCU_ADRESI + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
  });
  return cevabiCoz(res);
}

// ---------------------------------------------------------------------------
// Dokum
// ---------------------------------------------------------------------------

/**
 * Bir dokum kaydi. dokumNo ve konverterNo backend'de uretilir/rolden gelir,
 * istemci gondermez.
 */
export type Dokum = {
  dokumId: number;
  dokumNo: number;
  konverterNo: number;
  hurdaSarjBaslama: string;
  hurdaSarjBitis: string;
  anaUflemeBaslama: string;
  anaUflemeBitis: string;
  dokumZamani: string;
  shdSicaklik: number;
  dokumSicaklik: number;
  lansSkalDurum: string | null;
  kullaniciId: number;
  operatorId: number;
  operatorAdSoyad: string;
};

/** Yeni dokum kaydi - bes zamanin besi de zorunlu, kayit surec bitince girilir. */
export type YeniDokum = {
  hurdaSarjBaslama: string;
  hurdaSarjBitis: string;
  anaUflemeBaslama: string;
  anaUflemeBitis: string;
  dokumZamani: string;
  shdSicaklik: number;
  dokumSicaklik: number;
  lansSkalDurum: string | null;
  operatorId: number;
};

/** aktif=false olan operatorler yeni dokumde secilemez, gecmis dokumlerde gorunur. */
export type Operator = { operatorId: number; adSoyad: string; aktif: boolean };

/** Giristeki role gore filtrelenmis dokum listesi (KV1 kullanicisi sadece KV1'i gorur). */
export function dokumleriGetir(): Promise<Dokum[]> {
  return istek('/api/dokumler');
}

export function dokumGetir(dokumId: number): Promise<Dokum> {
  return istek('/api/dokumler/' + dokumId);
}

export function dokumOlustur(govde: YeniDokum): Promise<Dokum> {
  return istek('/api/dokumler', { method: 'POST', body: JSON.stringify(govde) });
}

/** Mevcut dokumu gunceller. Govde olusturmayla ayni. */
export function dokumGuncelle(dokumId: number, govde: YeniDokum): Promise<Dokum> {
  return istek('/api/dokumler/' + dokumId, { method: 'PUT', body: JSON.stringify(govde) });
}

/** Dokum siler. Backend yalnizca o konverterin en son dokumune izin verir. */
export function dokumSil(dokumId: number): Promise<null> {
  return istek('/api/dokumler/' + dokumId, { method: 'DELETE' });
}

export function operatorleriGetir(): Promise<Operator[]> {
  return istek('/api/operatorler');
}

// ---------------------------------------------------------------------------
// Malzeme
// ---------------------------------------------------------------------------

/** Malzeme katalogundaki bir satir. */
export type MalzemeTanim = {
  malzemeId: number;
  malzemeKodu: number;
  malzemeTuru: string;
  malzemeAdi: string;
};

/** Bir dokume girilmis malzeme kullanimi. */
export type MalzemeKullanim = {
  malzemeKullanimId: number;
  dokumId: number;
  malzemeId: number;
  malzemeAdi: string;
  malzemeTuru: string;
  miktar: number;
  verilisTarihi: string;
};

/** Katki turleri - backend'deki malzeme_turu degerleriyle birebir ayni olmali. */
export const KATKI_TURLERI = [
  { deger: 'KONVKATKI', ad: 'Konverter' },
  { deger: 'POTAKATKI', ad: 'Pota' },
  { deger: 'HURDAKATKI', ad: 'Hurda' },
] as const;

export function malzemeTanimlariGetir(tur: string): Promise<MalzemeTanim[]> {
  return istek('/api/dokum/malzemeler?tur=' + encodeURIComponent(tur));
}

export function dokumMalzemeleriGetir(dokumId: number): Promise<MalzemeKullanim[]> {
  return istek('/api/dokum/' + dokumId + '/malzemeler');
}

export function malzemeEkle(govde: {
  dokumId: number;
  malzemeId: number;
  miktar: number;
  verilisTarihi?: string;
}): Promise<MalzemeKullanim> {
  return istek('/api/dokum/malzeme', { method: 'POST', body: JSON.stringify(govde) });
}

export function malzemeSil(malzemeKullanimId: number): Promise<null> {
  return istek('/api/dokum/malzeme/' + malzemeKullanimId, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Rol kurallari
// ---------------------------------------------------------------------------

/** Butun konverterleri goren ama hicbir kayda dokunamayan rol. */
export const GENEL_KULLANICI = 'Genel_kullanici';

/**
 * Bu rol sadece goruntuleyebilir mi?
 * Arayuz ekleme/silme/guncelleme butonlarini buna gore gizler; backend de
 * ayni kurali uyguluyor, arayuz sadece gereksiz denemeyi onluyor.
 */
export function saltOkunur(rol: string): boolean {
  return rol === GENEL_KULLANICI;
}
