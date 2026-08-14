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

/** Kullanici koduna tanimli konverter/rol listesini getirir. */
export async function rolleriGetir(kullaniciKodu: string): Promise<string[]> {
  const res = await fetch(
    SUNUCU_ADRESI + '/api/roller?kullaniciKodu=' + encodeURIComponent(kullaniciKodu),
  );
  return cevabiCoz(res);
}

/** Giris yapar, token ciftini ve kullanici bilgisini doner. */
export async function girisYap(govde: {
  kullaniciKodu: string;
  parola: string;
  rol: string;
}): Promise<GirisCevabi> {
  const res = await fetch(SUNUCU_ADRESI + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
  });
  console.log('Giris cevabi: ' + res.status + ' ' + res.statusText);
  return cevabiCoz(res);
}
