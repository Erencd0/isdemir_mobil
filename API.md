# API Kontratı — Auth

Bu dosya backend ile frontend arasındaki anlaşmadır. Değişiklik önce burada
PR'lanır, sonra kod yazılır.

**Base URL (dev):** `http://localhost:8080`
Telefondan/emülatörden test için: `http://<backend-pc-ip>:8080` (aynı wifi)

Tüm gövdeler JSON. Hata formatı her endpoint'te aynı:

```json
{ "hata": "GECERSIZ_KIMLIK", "mesaj": "Kullanıcı adı veya parola hatalı" }
```

**Token ömürleri:** access 15 dk, refresh 7 gün.

---

## POST /api/auth/login

İstek:

```json
{ "kullaniciAdi": "eren", "parola": "123456" }
```

**200:**

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "9f2c1a4e-...",
  "tokenTipi": "Bearer",
  "gecerlilikSn": 900,
  "kullanici": { "id": 1, "kullaniciAdi": "eren", "rol": "ADMIN" }
}
```

Rol veritabanından gelir, kullanıcı seçmez. Ekranda gösterilir, kullanıcı
"giriş yap"a basınca frontend elindeki token'la ana ekrana geçer — ikinci
istek yok.

**400** `DOGRULAMA_HATASI` — boş alan
**401** `GECERSIZ_KIMLIK` — kullanıcı adı veya parola yanlış

---

## POST /api/auth/refresh

Access token'ın süresi dolunca çağrılır, kullanıcı görmez.

İstek:

```json
{ "refreshToken": "9f2c1a4e-..." }
```

**200:** login ile **birebir aynı gövde**. Refresh token da yenilenir, eskisi
geçersizleşir.

**401** `GECERSIZ_REFRESH` — yok / süresi dolmuş / logout ile pasife düşmüş
→ kullanıcıyı login ekranına at.

---

## POST /api/auth/logout

Header: `Authorization: Bearer <accessToken>`

İstek:

```json
{ "refreshToken": "9f2c1a4e-..." }
```

**204**, gövde yok. Token zaten geçersizse de 204 döner.
Backend `refresh_token_tablosu.aktif_pasif = false` yapar.

---

## Korumalı endpoint'ler

Auth dışındaki her istekte:

```
Authorization: Bearer <accessToken>
```

**401** → access token ölmüş. Bir kez `/api/auth/refresh` dene, olursa isteği
tekrarla. Refresh de 401 verdiyse login ekranına at — döngüye girme.

**403** → rol yetersiz. Refresh deneme, kullanıcıya "yetkin yok" göster.

---

## Frontend notları

- `accessToken` bellekte tutulur.
- `refreshToken` güvenli depoda: `flutter_secure_storage` /
  `EncryptedSharedPreferences` / Keychain. Düz SharedPreferences'a yazma.
- Parola düz metin gönderilir, hash'leme backend'in işi. Frontend'de
  hash'lemeye kalkma — o zaman hash parolanın yerine geçer.

## Roller

`ADMIN`, `OPERATOR` — JWT'nin `rol` claim'inde, backend'de doğrulanır.
