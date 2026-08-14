/**
 * Backend (Spring Boot) ile konusan tek yer.
 * Web projesindeki src/api.js dosyasinin mobil karsiligi.
 */
import { Platform } from 'react-native';

/**
 * Backend adresi calistigin ortama gore degisir:
 *   iOS Simulator     -> http://localhost:8080
 *   Android Emulator  -> http://10.0.2.2:8080   (emulatorde localhost telefonun kendisidir)
 *   Gercek telefon    -> bilgisayarinin yerel IP'si, orn. http://192.168.1.25:8080
 *                        (telefon ve bilgisayar ayni wifi'da olmali)
 */
export const SUNUCU_ADRESI = Platform.select({
  ios: 'http://localhost:8080',
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
}) as string;

/**
 * DEMO MODU
 *
 * Backend'in auth ucu hazir olmadigi icin girilen her kullanici adi ve parola
 * kabul edilir; sunucuya istek gitmez. Akisi bastan sona denemek icin.
 *
 * Backend hazir oldugunda tek yapilacak sey bunu false yapmak - ekran kodunda
 * hicbir degisiklik gerekmiyor.
 */
export const DEMO_MOD = true;

/** Demo modda gercek istek hissi vermek icin kisa bekleme. */
const bekle = (ms: number) => new Promise((coz) => setTimeout(coz, ms));

/** Giris sonrasi tasinan oturum bilgisi. */
export type Oturum = {
  kullaniciAdi: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
};

export type GirisCevabi = {
  accessToken: string;
  refreshToken: string;
  kullaniciAdi?: string;
  rol: string;
};

/** Cevabi cozer; sunucu hata dondurduyse anlamli bir mesajla firlatir. */
async function cevabiCoz(res: Response) {
  const govde = await res.text();

  if (!res.ok) {
    // Backend duz metin de JSON da donebiliyor, ikisini de dene
    try {
      const json = JSON.parse(govde);
      throw new Error(json.message || json.hata || 'Giris basarisiz');
    } catch (e) {
      throw new Error(govde || 'Sunucuya ulasilamadi (' + res.status + ')');
    }
  }

  return govde ? JSON.parse(govde) : null;
}

export type KontrolCevabi = {
  kullaniciAdi?: string;
  /** Kullaniciya tanimli konverter/rol listesi */
  roller: string[];
};

/**
 * Giris iki asamali: once kimlik kontrolu, sonra rol secilip giris.
 *
 * Bu adim kullanici adi + parolayi dogrular ve dogruysa o kullaniciya tanimli
 * rolleri doner. Roller ancak parola dogrulandiktan sonra aciga cikar; yanlis
 * parolayla kimsenin rol listesi ogrenilemez.
 *
 * DIKKAT: Bu endpoint henuz API.md'de yok, backend ile anlasilmasi gerekiyor.
 */
export async function kimlikKontrol(govde: {
  kullaniciKodu: string;
  parola: string;
}): Promise<KontrolCevabi> {
  if (DEMO_MOD) {
    await bekle(700);
    return { kullaniciAdi: govde.kullaniciKodu, roller: ['KV1', 'KV2', 'KV3'] };
  }

  const res = await fetch(SUNUCU_ADRESI + '/api/auth/kontrol', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
  });
  console.log('Kontrol cevabi: ' + res.status + ' ' + res.statusText);
  return cevabiCoz(res);
}

/** Giris yapar, token ciftini ve kullanici bilgisini doner. */
export async function girisYap(govde: {
  kullaniciKodu: string;
  parola: string;
  rol: string;
}): Promise<GirisCevabi> {
  if (DEMO_MOD) {
    await bekle(700);
    return {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      kullaniciAdi: govde.kullaniciKodu,
      rol: govde.rol,
    };
  }

  const res = await fetch(SUNUCU_ADRESI + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
  });
  console.log('Giris cevabi: ' + res.status + ' ' + res.statusText);
  return cevabiCoz(res);
}
