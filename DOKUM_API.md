# Döküm + Operatör API

Döküm diliminin endpoint kontratı. Malzeme dilimi ayrı (`malzeme_Tanim`, `malzeme_kullanim`).

Hepsi `Authorization: Bearer <accessToken>` ister. Token yoksa/ölmüşse
`401 { "hata": "GECERSIZ_TOKEN", ... }` döner ve istek controller'a hiç ulaşmaz.

**Konverter istemciden gelmez.** Oturumun rolü token'ın içindedir, konverter oradan
türetilir: `kv1 → 1`, `kv2 → 2`, `kv3 → 3`, `Genel_kullanici → kısıt yok (hepsi)`.
Rol değiştirmek için yeniden giriş gerekir.

---

## GET /api/dokumler

Rolün konverterindeki dökümler, döküm zamanına göre yeniden eskiye.
`Genel_kullanici` bütün konverterleri görür.

```json
[
  {
    "dokumId": 1,
    "dokumNo": 6300001,
    "konverterNo": 3,
    "hurdaSarjBaslama": "2026-08-14T08:00:00",
    "hurdaSarjBitis":   "2026-08-14T08:10:00",
    "anaUflemeBaslama": "2026-08-14T08:12:00",
    "anaUflemeBitis":   "2026-08-14T08:30:00",
    "dokumZamani":      "2026-08-14T08:45:00",
    "shdSicaklik": 1350.0,
    "dokumSicaklik": 1680.0,
    "lansSkalDurum": "normal",
    "kullaniciId": 2,
    "operatorId": 1,
    "operatorAdSoyad": "Ahmet Yilmaz"
  }
]
```

Sayfalama yok — bir konverterin döküm sayısı mobil ekranda tek listede taşınıyor.

## GET /api/dokumler/{dokumId}

Aynı gövde, tek kayıt. Döküm başka bir konvertere aitse `403 YETKISIZ_KONVERTER`.

## POST /api/dokumler

Yeni döküm. Kayıt süreç bittikten sonra girildiği için beş zamanın beşi de zorunlu.
`dokumNo` ve `konverterNo` **gönderilmez**, backend üretir.

```json
{
  "hurdaSarjBaslama": "2026-08-14T08:00:00",
  "hurdaSarjBitis":   "2026-08-14T08:10:00",
  "anaUflemeBaslama": "2026-08-14T08:12:00",
  "anaUflemeBitis":   "2026-08-14T08:30:00",
  "dokumZamani":      "2026-08-14T08:45:00",
  "shdSicaklik": 1350.0,
  "dokumSicaklik": 1680.0,
  "lansSkalDurum": "normal",
  "operatorId": 1
}
```

`201` ile yukarıdaki döküm gövdesi döner (üretilen `dokumNo` içinde).

## GET /api/operatorler

Döküm ekranındaki operatör combobox'ı. Sadece aktif operatörler.

```json
[{ "operatorId": 1, "adSoyad": "Ahmet Yilmaz" }]
```

---

## Döküm numarası

7 hane, hep `6` ile başlar, 2. hane roldeki konverter:

```
6  3  00001   ->  6300001   konverter 3'ün ilk dökümü
                  6300002   sonraki
                  6200001   konverter 2'nin ilk dökümü
```

Sıra her konverterde kendi içinde artar. `dokum_no` DB'de unique — iki döküm aynı
anda kaydedilirse ikincisi `409 KAYIT_CAKISMASI` alır, tekrar denenince düzelir.

## Zaman kuralları

Adımlar birbirini takip eder, hiçbiri kendinden öncekinden erken olamaz
(eşitlik serbest: bir adım diğerinin bittiği anda başlayabilir):

```
hurda şarj başlama ≤ hurda şarj bitiş ≤ ana üfleme başlama
                   ≤ ana üfleme bitiş ≤ döküm zamanı
```

Ayrıca **aynı konverterde iki döküm zaman olarak kesişemez** — yeni döküm, önceki
dökümün döküm zamanı geçmeden başlayamaz. Farklı konverterler birbirini kısıtlamaz,
paralel çalışırlar.

## Hata kodları

Gövde her zaman `{ "hata": "...", "mesaj": "..." }`.

| kod | durum | ne zaman |
|---|---|---|
| `DOGRULAMA_HATASI` | 400 | zorunlu alan boş, sıcaklık ≤ 0 |
| `ZAMAN_SIRASI` | 400 | adımlar sırasız |
| `OPERATOR_BULUNAMADI` | 400 | operatorId yok |
| `OPERATOR_PASIF` | 400 | pasif operatör seçildi |
| `GECERSIZ_TOKEN` | 401 | token yok / süresi doldu |
| `GECERSIZ_ROL` | 403 | token'daki rol tanınmıyor |
| `YETKISIZ_KONVERTER` | 403 | başka konverterin dökümü istendi |
| `KONVERTER_YOK` | 403 | `Genel_kullanici` döküm oluşturmaya çalıştı |
| `DOKUM_BULUNAMADI` | 404 | dokumId yok |
| `DOKUM_CAKISMASI` | 409 | zaman aralığı başka dökümle kesişiyor |
| `KAYIT_CAKISMASI` | 409 | aynı anda iki kayıt, tekrar dene |
| `DOKUM_NO_DOLDU` | 409 | konverterde 99999 döküm sınırı |
