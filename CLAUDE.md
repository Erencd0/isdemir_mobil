# isdemir_mobil

Döküm takip sistemi. Spring Boot 4.1 (Java 21) backend + mobil frontend,
veritabanı Supabase Postgres.

Auth kontratı: @API.md

## Çalışma düzeni

- `feature/login_backend` — Eren, Spring Boot tarafı
- `feature/login_frontend` — mobil taraf
- `main` — ortak referans, kontrat burada durur

Kontrat değişikliği (alan adı, hata kodu, endpoint) önce `API.md`'de PR'lanır,
sonra kod yazılır. Sürpriz değişiklik karşı tarafın ekranını patlatır.

## Kurallar

- JSON alan adları Türkçe camelCase, DB kolonlarıyla uyumlu:
  `kullanici_adi` → `kullaniciAdi`. Yarısı İngilizce olmasın.
- Parolalar BCrypt ile hash'lenir. Mock kullanıcılarda bile düz metin yazma.
- Sırlar (`application.properties` içindeki DB parolası) repoya girmez.
- Supabase sadece Postgres olarak kullanılıyor. Supabase Auth ve PostgREST
  devrede değil, tablolarda RLS açık ve policy yok — öyle kalsın. Mobil
  uygulamaya anon key gömülmez, her şey Spring backend üzerinden geçer.
