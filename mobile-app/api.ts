/**
 * Backend (Spring Boot) ile konusan tek yer.
 *
 * Kontrat: src/main/java/com/isdemir/mobile/controller/AuthController.java
 * Giris tek adrese gider, iki asamada da ayni endpoint kullanilir:
 *   rol GONDERILMEZ -> kullanici adi + parola dogrulanir, rol listesi doner
 *   rol GONDERILIR  -> secilen rol dogrulanir, token doner
 */
import { Platform } from 'react-native';

/**
 * Backend adresi calistigin ortama gore degisir:
 *   iOS Simulator     -> http://localhost:8080
 *   Android Emulator  -> http://10.0.2.2:8080   (emulatorde localhost telefonun kendisidir)
 *   Gercek telefon    -> bilgisayarin yerel IP'si, orn. http://192.168.1.25:8080
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
