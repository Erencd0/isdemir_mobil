# Dashboard Backend - İş Bölümü

Login backend'i bitti. Sıra dashboard'da. Backend iki kişiye bölünüyor.

## Kural: katman değil, dikey dilim

Yanlış: "sen entity + repository yaz, ben service + controller yazayım."
Sürekli birbirini bekler, aynı dosyalarda merge conflict çıkar.

Doğru: **herkes kendi tablo grubunun entity → repository → service → controller → DTO
zincirini uçtan uca yazar.** Farklı paketler, farklı dosyalar, çakışma yok.

## Kim ne yapıyor

| | Döküm dilimi | Malzeme dilimi |
|---|---|---|
| Kişi | Eren | arkadaş |
| Tablolar | `dokum_tablosu`, `operator` | `malzeme_Tanim`, `malzeme_kullanim` |
| İşler | döküm listele / detay / oluştur, süreç zamanları (hurda şarj, ana üfleme, döküm zamanı), sıcaklıklar, operatör listesi | malzeme tanım listesi, bir dökümün malzeme kullanımları, malzeme kullanım kaydı |

### Bağımlılığı kesen tek detay

`malzeme_kullanim.dokum_id` bir foreign key. Malzeme tarafı döküm tarafının
`Dokum` entity'sini **beklemesin**:

```java
// malzeme_kullanim entity'sinde ILISKI MAPPING'I YOK:
@Column(name = "dokum_id")
private Long dokumId;          // @ManyToOne Dokum DEĞİL
```

`Kullanici` entity'sinde de ilişki mapping'i kullanmadık, tutarlı olur ve iki taraf
birbirini hiç beklemez.

## Bölünmeden önce bitmesi gerekenler

Bunlar ortak dosya, ikimiz birden dokunursak çakışır. Tek kişi yapar, main'e atar,
ondan sonra dallar açılır.

1. **Endpoint kontratı** — tek markdown dosyası: path, method, istek/cevap gövdesi.
   İkimiz de onaylayınca frontend'ci de paralel başlayabilir.
2. **Rol yetkisi kararı** — **DURUM: karar verildi, yapıldı.**

   Access token'da artık `rol` claim'i var. Oturumun rolü
   `refresh_token_tablosu.rol` kolonunda durur; refresh o rolle yeni token üretir,
   yani rol oturum boyunca sabit — değiştirmek için yeniden giriş gerekir.

   Controller'da okumak için: `@RequestAttribute(JwtFiltresi.ROL) String rol`
   (`AuthController.logout`'un `KULLANICI_ID` okuduğu kalıbın aynısı).

   **Rol → konverter eşlemesi:** `dokum_tablosu`'nda rol kolonu yok, `konverter_no` var.
   Roller `kv1, kv2, kv3, Genel_kullanici`. Yani "kv1 sadece kv1 dökümlerini görür"
   pratikte `konverter_no = 1` filtresi. `Genel_kullanici` hepsini görür mü, o kararı
   döküm listeleme endpoint'i yazılırken vereceğiz.
3. **Düzen ve format** — mevcut `controller / service / repository / entity / dto`
   paket düzeni sürdürülür. Hata formatı `HataCevap`. Listelemede sayfalama olacaksa
   cevap şekli tek yerde kararlaştırılır.

## Git

- Dallar: `feature/dokum`, `feature/malzeme`
- Günde en az bir kere main'e merge.
- Ortak dosyalar: `pom.xml`, `application.properties`, `JwtFiltresi`, `JwtYonetici`,
  `AuthService`. Dokunmadan önce diğerine haber ver, aynı anda ikimiz açmayalım.
