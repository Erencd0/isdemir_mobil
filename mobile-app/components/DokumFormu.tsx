import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';
import { saat, sureMetni } from '../zaman';
import MalzemeSecModal from './MalzemeEkleModal';

type BekleyenMalzeme = { tanim: api.MalzemeTanim; miktar: number };

type Props = {
  /** Doluysa duzenleme modu, bossa yeni kayit. */
  dokum?: api.Dokum;
  /** Bu konverterdeki en son dokumun zamani - yeni dokum bundan sonra baslamali. */
  sonDokumZamani?: string | null;
  onGeri: () => void;
  onKaydedildi: () => void;
};

/** Web'deki secenekler. Backend bu alani dogrulamiyor, serbest metin. */
const LANS_SECENEKLERI = ['Az Skallı', 'Skallı', 'Çok Skallı'];

const ADIMLAR = [
  { ad: 'Hurda şarj başlama', renk: 'bg-amber-400' },
  { ad: 'Hurda şarj bitiş', renk: 'bg-amber-400' },
  { ad: 'Ana üfleme başlama', renk: 'bg-isdemir-500' },
  { ad: 'Ana üfleme bitiş', renk: 'bg-isdemir-500' },
  { ad: 'Döküm', renk: 'bg-neutral-900' },
];

const ikiHane = (n: number) => (n < 10 ? '0' + n : String(n));

/** ISO metinden sadece saat/dakikayi alip bugune tasiyan Date uretir. */
function saatiCoz(iso?: string | null): Date | null {
  if (!iso || iso.length < 16) return null;
  const d = new Date();
  d.setHours(Number(iso.slice(11, 13)), Number(iso.slice(14, 16)), 0, 0);
  return d;
}

export default function DokumFormu({ dokum, sonDokumZamani, onGeri, onKaydedildi }: Props) {
  const guvenliAlan = useSafeAreaInsets();
  const duzenleme = !!dokum;

  const [gun, setGun] = useState(() =>
    dokum ? new Date(dokum.dokumZamani.slice(0, 10) + 'T12:00:00') : new Date(),
  );
  const [zamanlar, setZamanlar] = useState<(Date | null)[]>(() =>
    dokum
      ? [
          saatiCoz(dokum.hurdaSarjBaslama),
          saatiCoz(dokum.hurdaSarjBitis),
          saatiCoz(dokum.anaUflemeBaslama),
          saatiCoz(dokum.anaUflemeBitis),
          saatiCoz(dokum.dokumZamani),
        ]
      : [null, null, null, null, null],
  );

  const [shd, setShd] = useState(dokum ? String(Math.round(dokum.shdSicaklik)) : '');
  const [dokumSicaklik, setDokumSicaklik] = useState(
    dokum ? String(Math.round(dokum.dokumSicaklik)) : '',
  );
  const [lans, setLans] = useState<string | null>(dokum?.lansSkalDurum ?? null);

  const [operatorler, setOperatorler] = useState<api.Operator[]>([]);
  const [operator, setOperator] = useState<api.Operator | null>(null);
  const [operatorAcik, setOperatorAcik] = useState(false);

  const [malzemeler, setMalzemeler] = useState<BekleyenMalzeme[]>([]);
  const [malzemeAcik, setMalzemeAcik] = useState(false);

  const [seciciAcik, setSeciciAcik] = useState<number | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    api
      .operatorleriGetir()
      .then((gelen) => {
        setOperatorler(gelen);
        if (dokum) {
          setOperator(gelen.find((o) => o.operatorId === dokum.operatorId) ?? null);
        }
      })
      .catch(() => setOperatorler([]));
  }, [dokum]);

  function zamanAyarla(sira: number, deger: Date) {
    const yeni = [...zamanlar];
    yeni[sira] = deger;
    setZamanlar(yeni);
    setHata(null);
  }

  /** Secici acilirken makul bir baslangic: onceki adimdan 10 dakika sonrasi. */
  function seciciBaslangici(sira: number): Date {
    if (zamanlar[sira]) return zamanlar[sira] as Date;
    const onceki = sira > 0 ? zamanlar[sira - 1] : null;
    if (onceki) {
      const d = new Date(onceki);
      d.setMinutes(d.getMinutes() + 10);
      return d;
    }
    return new Date();
  }

  const hepsiDolu = zamanlar.every((z) => z !== null);

  /** Gun + saatleri, gece yarisi devrini hesaba katarak ISO metne cevirir. */
  function isoUret(): string[] {
    let gunEklentisi = 0;
    let oncekiDakika = -1;

    return zamanlar.map((z) => {
      const d = z as Date;
      const dk = d.getHours() * 60 + d.getMinutes();
      if (oncekiDakika >= 0 && dk < oncekiDakika) gunEklentisi += 1;
      oncekiDakika = dk;

      const t = new Date(gun);
      t.setDate(t.getDate() + gunEklentisi);
      return (
        t.getFullYear() +
        '-' + ikiHane(t.getMonth() + 1) +
        '-' + ikiHane(t.getDate()) +
        'T' + ikiHane(d.getHours()) +
        ':' + ikiHane(d.getMinutes()) +
        ':00'
      );
    });
  }

  const shdSayi = Number(shd.replace(',', '.'));
  const dokumSayi = Number(dokumSicaklik.replace(',', '.'));

  // Kaydet butonu bunlarin hepsi tamamlanmadan basilamaz (madde 2)
  const gecerli =
    hepsiDolu &&
    !!shd && !Number.isNaN(shdSayi) && shdSayi > 0 &&
    !!dokumSicaklik && !Number.isNaN(dokumSayi) && dokumSayi > 0 &&
    !!operator;

  const sureler = hepsiDolu
    ? (() => {
        const iso = isoUret();
        const fark = (a: string, b: string) =>
          Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
        return { sarj: fark(iso[0], iso[1]), ufleme: fark(iso[2], iso[3]), toplam: fark(iso[0], iso[4]) };
      })()
    : null;

  function gunDegistir(adim: number) {
    const yeni = new Date(gun);
    yeni.setDate(yeni.getDate() + adim);
    if (yeni > new Date()) return;
    setGun(yeni);
    setHata(null);
  }

  async function kaydet() {
    if (!gecerli) return;

    const iso = isoUret();
    const govde: api.YeniDokum = {
      hurdaSarjBaslama: iso[0],
      hurdaSarjBitis: iso[1],
      anaUflemeBaslama: iso[2],
      anaUflemeBitis: iso[3],
      dokumZamani: iso[4],
      shdSicaklik: shdSayi,
      dokumSicaklik: dokumSayi,
      lansSkalDurum: lans,
      operatorId: (operator as api.Operator).operatorId,
    };

    setKaydediliyor(true);
    setHata(null);

    try {
      if (duzenleme) {
        await api.dokumGuncelle((dokum as api.Dokum).dokumId, govde);
        Alert.alert('Döküm güncellendi', '#' + (dokum as api.Dokum).dokumNo, [
          { text: 'Tamam', onPress: onKaydedildi },
        ]);
        return;
      }

      const olusan = await api.dokumOlustur(govde);

      // Formda biriken malzemeler dokum olustuktan sonra tek tek eklenir
      const basarisiz: string[] = [];
      for (const m of malzemeler) {
        try {
          await api.malzemeEkle({
            dokumId: olusan.dokumId,
            malzemeId: m.tanim.malzemeId,
            miktar: m.miktar,
          });
        } catch {
          basarisiz.push(m.tanim.malzemeAdi);
        }
      }

      const mesaj =
        '#' + olusan.dokumNo +
        (basarisiz.length ? '\n\nEklenemeyen malzeme: ' + basarisiz.join(', ') : '');

      Alert.alert('Döküm kaydedildi', mesaj, [{ text: 'Tamam', onPress: onKaydedildi }]);
    } catch (err) {
      setHata((err as Error).message);
    } finally {
      setKaydediliyor(false);
    }
  }

  const bugun = gun.toDateString() === new Date().toDateString();
  const secilebilirOperatorler = operatorler.filter((o) => o.aktif || o.operatorId === operator?.operatorId);

  return (
    <View className="flex-1 bg-kurum-950">
      {/* ---------- koyu ust bant ---------- */}
      <View style={{ paddingTop: guvenliAlan.top + 10 }} className="overflow-hidden pb-6">
        <LinearGradient
          colors={['#1C1C21', '#0E0E11', '#070708']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-row items-center px-4">
          <Pressable
            onPress={onGeri}
            accessibilityRole="button"
            accessibilityLabel="Vazgeç"
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-white/10"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="ml-1 text-[15px] font-semibold text-white/60">Vazgeç</Text>
        </View>
        <Text className="mt-3 px-6 text-[26px] font-extrabold tracking-tight text-white">
          {duzenleme ? 'Dökümü Düzenle' : 'Yeni Döküm'}
        </Text>
        <Text className="mt-1 px-6 text-[13px] text-white/45">
          {duzenleme
            ? '#' + dokum.dokumNo + ' · numara ve konverter değişmez'
            : 'Döküm no ve konverter otomatik atanır'}
        </Text>
      </View>

      {/* ---------- beyaz sayfa ---------- */}
      <KeyboardAvoidingView
        className="-mt-4 flex-1 rounded-t-[28px] bg-neutral-50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 22, paddingBottom: guvenliAlan.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* önceki döküm uyarısı (madde 1) */}
          {!duzenleme && sonDokumZamani && (
            <View className="mb-5 flex-row items-start rounded-xl bg-amber-50 px-4 py-3">
              <Ionicons name="information-circle" size={18} color="#B45309" />
              <Text className="ml-2 flex-1 text-[13px] leading-[18px] text-amber-800">
                Bu konverterdeki son döküm {saat(sonDokumZamani)}'de tamamlandı. Yeni döküm bu
                saatten sonra başlamalı.
              </Text>
            </View>
          )}

          {/* gün */}
          <Text className="mb-2 text-[13px] font-semibold text-neutral-700">Döküm günü</Text>
          <View className="h-[52px] flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-2">
            <Pressable
              onPress={() => gunDegistir(-1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Önceki gün"
              className="h-9 w-9 items-center justify-center rounded-lg active:bg-neutral-100"
            >
              <Ionicons name="chevron-back" size={18} color="#525252" />
            </Pressable>
            <Text className="text-[15px] font-semibold text-neutral-900">
              {ikiHane(gun.getDate())}.{ikiHane(gun.getMonth() + 1)}.{gun.getFullYear()}
              {bugun ? '  ·  Bugün' : ''}
            </Text>
            <Pressable
              onPress={() => gunDegistir(1)}
              hitSlop={8}
              disabled={bugun}
              accessibilityRole="button"
              accessibilityLabel="Sonraki gün"
              className={
                'h-9 w-9 items-center justify-center rounded-lg active:bg-neutral-100 ' +
                (bugun ? 'opacity-30' : '')
              }
            >
              <Ionicons name="chevron-forward" size={18} color="#525252" />
            </Pressable>
          </View>

          {/* süreç saatleri - dokununca tekerlek seçici açılır (madde 11) */}
          <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">
            Süreç saatleri
          </Text>
          <View className="rounded-2xl border border-neutral-200 bg-white px-4 py-1">
            {ADIMLAR.map((adim, i) => (
              <View key={adim.ad}>
                {i > 0 && <View className="h-px bg-neutral-100" />}
                <Pressable
                  onPress={() => setSeciciAcik(i)}
                  accessibilityRole="button"
                  accessibilityLabel={adim.ad + ' saatini seç'}
                  className="flex-row items-center py-3.5 active:opacity-60"
                >
                  <View className={'h-2.5 w-2.5 rounded-full ' + adim.renk} />
                  <Text className="ml-2.5 flex-1 text-[14px] text-neutral-800">{adim.ad}</Text>
                  <Text
                    className={
                      'text-[17px] font-bold ' +
                      (zamanlar[i] ? 'text-neutral-900' : 'text-neutral-300')
                    }
                  >
                    {zamanlar[i]
                      ? ikiHane((zamanlar[i] as Date).getHours()) +
                        ':' +
                        ikiHane((zamanlar[i] as Date).getMinutes())
                      : '--:--'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#C4C4C8"
                    style={{ marginLeft: 6 }}
                  />
                </Pressable>
              </View>
            ))}
          </View>

          {sureler && (
            <View className="mt-3 flex-row gap-2">
              <SureRozeti etiket="Şarj" dakika={sureler.sarj} />
              <SureRozeti etiket="Üfleme" dakika={sureler.ufleme} />
              <SureRozeti etiket="Toplam" dakika={sureler.toplam} koyu />
            </View>
          )}

          {/* sıcaklıklar */}
          <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">Sıcaklıklar</Text>
          <View className="flex-row gap-3">
            <SicaklikGiris etiket="SHD" ipucu="1200-1500" deger={shd} onDegis={(v) => { setShd(v); setHata(null); }} />
            <SicaklikGiris
              etiket="Döküm"
              ipucu="1500-1700"
              deger={dokumSicaklik}
              onDegis={(v) => { setDokumSicaklik(v); setHata(null); }}
            />
          </View>

          {/* operatör */}
          <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">Operatör</Text>
          <Pressable
            onPress={() => setOperatorAcik(true)}
            accessibilityRole="button"
            accessibilityLabel="Operatör seç"
            className="h-[52px] flex-row items-center rounded-xl border border-neutral-200 bg-white px-3.5"
          >
            {operator ? (
              <View
                className={
                  'h-2.5 w-2.5 rounded-full ' + (operator.aktif ? 'bg-emerald-500' : 'bg-isdemir-500')
                }
              />
            ) : (
              <Ionicons name="person-outline" size={19} color="#9CA3AF" />
            )}
            <Text
              className={
                'ml-2.5 flex-1 text-[15px] ' + (operator ? 'text-neutral-900' : 'text-neutral-400')
              }
            >
              {operator ? operator.adSoyad : 'Operatör seçiniz'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </Pressable>

          {/* lans skalası */}
          <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">
            Lans skalası <Text className="font-normal text-neutral-400">· isteğe bağlı</Text>
          </Text>
          <View className="flex-row gap-2">
            {LANS_SECENEKLERI.map((secenek) => {
              const secili = lans === secenek;
              return (
                <Pressable
                  key={secenek}
                  onPress={() => setLans(secili ? null : secenek)}
                  accessibilityRole="button"
                  className={
                    'flex-1 items-center rounded-xl border py-2.5 ' +
                    (secili ? 'border-isdemir-500 bg-isdemir-50' : 'border-neutral-200 bg-white')
                  }
                >
                  <Text
                    className={
                      'text-[13px] ' + (secili ? 'font-bold text-isdemir-700' : 'text-neutral-600')
                    }
                  >
                    {secenek}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* malzemeler - sadece yeni kayitta (madde 4) */}
          {!duzenleme && (
            <>
              <View className="mb-2 mt-6 flex-row items-baseline justify-between">
                <Text className="text-[13px] font-semibold text-neutral-700">
                  Malzemeler <Text className="font-normal text-neutral-400">· isteğe bağlı</Text>
                </Text>
                {malzemeler.length > 0 && (
                  <Text className="text-[12px] text-neutral-400">{malzemeler.length} kalem</Text>
                )}
              </View>

              {malzemeler.map((m, i) => (
                <View
                  key={m.tanim.malzemeId + '-' + i}
                  className="mb-2 flex-row items-center rounded-xl border border-neutral-200 bg-white px-3.5 py-3"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-[14px] text-neutral-800" numberOfLines={1}>
                      {m.tanim.malzemeAdi}
                    </Text>
                  </View>
                  <Text className="mr-3 text-[14px] font-extrabold text-neutral-900">
                    {m.miktar}
                    <Text className="text-[12px] font-semibold text-neutral-400"> kg</Text>
                  </Text>
                  <Pressable
                    onPress={() => setMalzemeler(malzemeler.filter((_, j) => j !== i))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Malzemeyi çıkar"
                  >
                    <Ionicons name="close-circle" size={20} color="#C4C4C8" />
                  </Pressable>
                </View>
              ))}

              <Pressable
                onPress={() => setMalzemeAcik(true)}
                accessibilityRole="button"
                accessibilityLabel="Malzeme ekle"
                className="h-[48px] flex-row items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white active:bg-neutral-50"
              >
                <Ionicons name="add" size={19} color="#525252" />
                <Text className="ml-1.5 text-[14px] font-semibold text-neutral-700">
                  Malzeme Ekle
                </Text>
              </Pressable>
            </>
          )}

          {hata && (
            <View className="mt-5 flex-row items-center rounded-xl bg-isdemir-50 px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#E11D25" />
              <Text className="ml-2 flex-1 text-[13px] leading-[18px] text-isdemir-700">{hata}</Text>
            </View>
          )}

          <Pressable
            onPress={kaydet}
            disabled={!gecerli || kaydediliyor}
            accessibilityRole="button"
            accessibilityLabel={duzenleme ? 'Değişiklikleri kaydet' : 'Dökümü kaydet'}
            className={
              'mt-6 h-[56px] flex-row items-center justify-center rounded-xl ' +
              (gecerli && !kaydediliyor
                ? 'bg-isdemir-500 active:bg-isdemir-600'
                : 'bg-neutral-300')
            }
          >
            {kaydediliyor ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[17px] font-bold text-white">
                {duzenleme ? 'Değişiklikleri Kaydet' : 'Dökümü Kaydet'}
              </Text>
            )}
          </Pressable>

          {!gecerli && (
            <Text className="mt-2.5 text-center text-[12px] text-neutral-400">
              Tüm saatler, sıcaklıklar ve operatör girilmeden kaydedilemez
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* saat seçici - iPhone alarm ekranindaki tekerlek */}
      <Modal
        visible={seciciAcik !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSeciciAcik(null)}
      >
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setSeciciAcik(null)}>
          <Pressable className="rounded-t-3xl bg-white px-5 pb-10 pt-4" onPress={() => {}}>
            <View className="mb-2 h-1 w-10 self-center rounded-full bg-neutral-300" />
            <Text className="mb-1 text-center text-[15px] font-bold text-neutral-900">
              {seciciAcik !== null ? ADIMLAR[seciciAcik].ad : ''}
            </Text>
            {seciciAcik !== null && (
              <DateTimePicker
                value={seciciBaslangici(seciciAcik)}
                mode="time"
                display="spinner"
                locale="tr-TR"
                is24Hour
                minuteInterval={1}
                onChange={(_olay, secilen) => {
                  if (secilen) zamanAyarla(seciciAcik, secilen);
                }}
              />
            )}
            <Pressable
              onPress={() => {
                // Kullanici tekerlegi hic oynatmazsa da o an gorunen degeri al
                if (seciciAcik !== null && !zamanlar[seciciAcik]) {
                  zamanAyarla(seciciAcik, seciciBaslangici(seciciAcik));
                }
                setSeciciAcik(null);
              }}
              accessibilityRole="button"
              className="mt-2 h-[50px] items-center justify-center rounded-xl bg-isdemir-500 active:bg-isdemir-600"
            >
              <Text className="text-[16px] font-bold text-white">Tamam</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* operatör seçimi - aktif yeşil, pasif kırmızı (madde 10) */}
      <Modal
        visible={operatorAcik}
        transparent
        animationType="fade"
        onRequestClose={() => setOperatorAcik(false)}
      >
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setOperatorAcik(false)}>
          <View className="max-h-[70%] rounded-t-3xl bg-white px-5 pb-10 pt-5">
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-neutral-300" />
            <Text className="mb-3 text-[13px] font-bold tracking-[1.5px] text-neutral-500">
              OPERATÖR SEÇİN
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {secilebilirOperatorler.length === 0 && (
                <Text className="py-6 text-center text-[13px] text-neutral-400">
                  Operatör listesi alınamadı
                </Text>
              )}
              {secilebilirOperatorler.map((o) => {
                const secili = operator?.operatorId === o.operatorId;
                return (
                  <Pressable
                    key={o.operatorId}
                    onPress={() => {
                      setOperator(o);
                      setOperatorAcik(false);
                      setHata(null);
                    }}
                    accessibilityRole="button"
                    className={
                      'mb-2 flex-row items-center rounded-xl border px-4 py-4 ' +
                      (secili ? 'border-isdemir-500 bg-isdemir-50' : 'border-neutral-200 bg-white')
                    }
                  >
                    <View
                      className={
                        'h-2.5 w-2.5 rounded-full ' + (o.aktif ? 'bg-emerald-500' : 'bg-isdemir-500')
                      }
                    />
                    <Text
                      className={
                        'ml-3 flex-1 text-[15px] ' +
                        (secili ? 'font-semibold text-isdemir-600' : 'text-neutral-800')
                      }
                    >
                      {o.adSoyad}
                    </Text>
                    {!o.aktif && (
                      <Text className="mr-2 text-[12px] font-semibold text-isdemir-600">pasif</Text>
                    )}
                    {secili && <Ionicons name="checkmark-circle" size={20} color="#E11D25" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* malzeme secimi - kayit atmaz, listeye ekler */}
      <MalzemeSecModal
        acik={malzemeAcik}
        dokumId={null}
        baslangicTuru={api.KATKI_TURLERI[0].deger}
        onKapat={() => setMalzemeAcik(false)}
        onSecim={(tanim, miktar) => {
          setMalzemeler([...malzemeler, { tanim, miktar }]);
          setMalzemeAcik(false);
        }}
        onEklendi={() => setMalzemeAcik(false)}
      />
    </View>
  );
}

function SureRozeti({ etiket, dakika, koyu }: { etiket: string; dakika: number; koyu?: boolean }) {
  return (
    <View
      className={
        'flex-1 items-center rounded-xl py-2 ' + (koyu ? 'bg-neutral-900' : 'bg-white border border-neutral-200')
      }
    >
      <Text className={'text-[11px] ' + (koyu ? 'text-white/60' : 'text-neutral-500')}>{etiket}</Text>
      <Text className={'text-[14px] font-bold ' + (koyu ? 'text-white' : 'text-neutral-900')}>
        {sureMetni(dakika)}
      </Text>
    </View>
  );
}

function SicaklikGiris({
  etiket,
  ipucu,
  deger,
  onDegis,
}: {
  etiket: string;
  ipucu: string;
  deger: string;
  onDegis: (v: string) => void;
}) {
  return (
    <View className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-3">
      <Text className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">
        {etiket}
      </Text>
      <View className="mt-1 flex-row items-baseline">
        <TextInput
          value={deger}
          onChangeText={onDegis}
          placeholder="0"
          placeholderTextColor="#C4C4C8"
          keyboardType="number-pad"
          maxLength={5}
          className="flex-1 text-[22px] font-extrabold text-neutral-900"
        />
        <Text className="text-[14px] font-semibold text-neutral-400">°C</Text>
      </View>
      <Text className="mt-0.5 text-[11px] text-neutral-400">{ipucu}</Text>
    </View>
  );
}
