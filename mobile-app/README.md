# İSDEMİR Döküm Takip — Mobil Uygulama

React Native (Expo) + NativeWind (Tailwind) ile yazılmış mobil uygulama.
Backend olarak bu repo'nun kökündeki Spring Boot projesini kullanır.

## İlk kurulum

Repo'yu çektikten sonra bu klasörde bir kez çalıştırın:

```bash
npm install
```

`node_modules` repoya girmiyor, herkes kendi bilgisayarında kuruyor.

## Çalıştırma

```bash
npm start
```

Terminal açıldıktan sonra:

- `i` → iOS Simulator'da açar (Mac + Xcode gerekir)
- `a` → Android emülatöründe açar
- QR kod → telefondaki **Expo Go** uygulamasıyla okutun

Ekran değişmiyorsa veya garip hatalar alıyorsanız cache temizleyerek başlatın:

```bash
npx expo start --clear
```

## Backend adresi

`api.ts` dosyasındaki `SUNUCU_ADRESI` sabiti ortama göre değişir:

| Nerede çalışıyorsun | Adres |
|---|---|
| iOS Simulator | `http://localhost:8080` |
| Android Emulator | `http://10.0.2.2:8080` |
| Gerçek telefon | `http://<bilgisayarın-yerel-IP>:8080` |

Adres elle girilmiyor: gerçek telefonda Metro sunucusunun adresinden (yani
bilgisayarın yerel IP'sinden) otomatik türetiliyor. Tek şart telefon ve
bilgisayarın aynı wifi'da olması.

Backend'i ayrı bir terminalde çalıştırmayı unutmayın:

```bash
./mvnw spring-boot:run
```

## Dosya düzeni

```
App.tsx                      giris noktasi
api.ts                       backend cagrilari (/api/roller, /api/login)
global.css                   tailwind direktifleri
tailwind.config.js           kurumsal renkler (isdemir-500, kurum-900 ...)
components/
  GirisEkrani.tsx            giris ekrani - form + dogrulama
  HeroPanel.tsx              koyu ust bant (logo, baslik, KV1/KV2/KV3)
  RolSecici.tsx              konverter/rol secimi (alttan acilan liste)
  IsdemirLogo.tsx            GECICI logo - resmi logoyla degistirilecek
```

## Yapılacaklar

- [ ] `IsdemirLogo.tsx` yerine kurumun resmi logosunu koy (`assets/isdemir-logo.png`)
- [ ] Giriş başarılı olunca döküm ekranına yönlendirme (react-navigation kurulacak)
- [ ] Token'ları cihazda saklama (`expo-secure-store`) — web'deki `oturum.js` karşılığı
