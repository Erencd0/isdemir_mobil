import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';
import { saat, tarih } from '../zaman';
import MalzemeEkleModal from './MalzemeEkleModal';
import SicaklikKarti from './Sicaklik';
import { SurecCizgisi } from './Surec';

type Props = {
  dokum: api.Dokum;
  /** Oturum rolu - Genel_kullanici hicbir islem butonunu gormez (madde 9). */
  rol: string;
  /** Bu dokum konverterin en sonuncusu mu? Sadece o silinebilir (madde 5). */
  sonDokumMu: boolean;
  onGeri: () => void;
  onDuzenle: () => void;
  onSilindi: () => void;
};

export default function DokumDetay({
  dokum,
  rol,
  sonDokumMu,
  onGeri,
  onDuzenle,
  onSilindi,
}: Props) {
  const guvenliAlan = useSafeAreaInsets();
  const saltOkunur = api.saltOkunur(rol);

  const [kullanimlar, setKullanimlar] = useState<api.MalzemeKullanim[] | null>(null);
  const [sekme, setSekme] = useState<string>(api.KATKI_TURLERI[0].deger);
  const [ekleAcik, setEkleAcik] = useState(false);

  const yukle = useCallback(async () => {
    try {
      setKullanimlar(await api.dokumMalzemeleriGetir(dokum.dokumId));
    } catch {
      setKullanimlar([]);
    }
  }, [dokum.dokumId]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const sekmedekiler = (kullanimlar ?? []).filter((k) => k.malzemeTuru === sekme);

  function silmeyiSor(kayit: api.MalzemeKullanim) {
    Alert.alert(
      'Malzeme silinsin mi?',
      kayit.malzemeAdi + ' — ' + kayit.miktar + ' kg',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.malzemeSil(kayit.malzemeKullanimId);
              yukle();
            } catch (err) {
              Alert.alert('Silinemedi', (err as Error).message);
            }
          },
        },
      ],
    );
  }

  function dokumSilmeyiSor() {
    Alert.alert(
      'Döküm silinsin mi?',
      '#' + dokum.dokumNo + ' ve bu döküme girilmiş tüm malzeme kayıtları silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.dokumSil(dokum.dokumId);
              onSilindi();
            } catch (err) {
              Alert.alert('Silinemedi', (err as Error).message);
            }
          },
        },
      ],
    );
  }

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
            accessibilityLabel="Geri"
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-white/10"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="ml-1 text-[15px] font-semibold text-white/60">Döküm Detayı</Text>
        </View>

        <View className="mt-3 flex-row items-end justify-between px-6">
          <View>
            <Text className="text-[28px] font-extrabold tracking-tight text-white">
              #{dokum.dokumNo}
            </Text>
            <Text className="mt-0.5 text-[13px] text-white/45">
              {tarih(dokum.dokumZamani)} · {saat(dokum.dokumZamani)}
            </Text>
          </View>
          <View className="rounded-lg bg-isdemir-500 px-2.5 py-1">
            <Text className="text-[13px] font-extrabold tracking-wider text-white">
              KV{dokum.konverterNo}
            </Text>
          </View>
        </View>
      </View>

      {/* ---------- beyaz sayfa ---------- */}
      <View className="-mt-4 flex-1 rounded-t-[28px] bg-neutral-50">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 22, paddingBottom: guvenliAlan.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* süreç */}
          <Text className="mb-4 text-[17px] font-extrabold tracking-tight text-neutral-900">
            Süreç
          </Text>
          <View className="rounded-2xl border border-neutral-200 bg-white p-4">
            <SurecCizgisi dokum={dokum} />
          </View>

          {/* sıcaklıklar */}
          <Text className="mb-3 mt-7 text-[17px] font-extrabold tracking-tight text-neutral-900">
            Sıcaklıklar
          </Text>
          <View className="flex-row gap-3">
            <SicaklikKarti etiket="SHD" deger={dokum.shdSicaklik} altSinir={1200} ustSinir={1500} />
            <SicaklikKarti
              etiket="Döküm"
              deger={dokum.dokumSicaklik}
              altSinir={1500}
              ustSinir={1700}
            />
          </View>

          {/* künye */}
          <View className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
            <SatirBilgi etiket="Operatör" deger={dokum.operatorAdSoyad || 'seçilmemiş'} />
            <View className="my-3 h-px bg-neutral-100" />
            <SatirBilgi etiket="Lans skalası" deger={dokum.lansSkalDurum || 'belirtilmemiş'} />
          </View>

          {/* malzemeler */}
          <View className="mb-3 mt-7 flex-row items-center justify-between">
            <Text className="text-[17px] font-extrabold tracking-tight text-neutral-900">
              Malzemeler
            </Text>
            {!saltOkunur && (
              <Pressable
                onPress={() => setEkleAcik(true)}
                accessibilityRole="button"
                accessibilityLabel="Malzeme ekle"
                className="flex-row items-center rounded-lg bg-isdemir-500 px-3 py-1.5 active:bg-isdemir-600"
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text className="ml-1 text-[13px] font-bold text-white">Ekle</Text>
              </Pressable>
            )}
          </View>

          {/* sekmeler - her sekmede kac kayit var rozette gorunuyor */}
          <View className="flex-row rounded-xl bg-neutral-200/70 p-1">
            {api.KATKI_TURLERI.map((tur) => {
              const adet = (kullanimlar ?? []).filter((k) => k.malzemeTuru === tur.deger).length;
              const secili = sekme === tur.deger;
              return (
                <Pressable
                  key={tur.deger}
                  onPress={() => setSekme(tur.deger)}
                  accessibilityRole="button"
                  className={
                    'flex-1 flex-row items-center justify-center rounded-lg py-2 ' +
                    (secili ? 'bg-white' : '')
                  }
                >
                  <Text
                    className={
                      'text-[13px] font-semibold ' +
                      (secili ? 'text-neutral-900' : 'text-neutral-500')
                    }
                  >
                    {tur.ad}
                  </Text>
                  {adet > 0 && (
                    <View
                      className={
                        'ml-1.5 h-5 min-w-[20px] items-center justify-center rounded-full px-1 ' +
                        (secili ? 'bg-isdemir-500' : 'bg-neutral-300')
                      }
                    >
                      <Text
                        className={
                          'text-[11px] font-bold ' + (secili ? 'text-white' : 'text-neutral-600')
                        }
                      >
                        {adet}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="mt-3">
            {kullanimlar === null ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#E11D25" />
              </View>
            ) : sekmedekiler.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-neutral-300 py-8">
                <Text className="text-[13px] text-neutral-400">
                  Bu katkı türünde malzeme eklenmemiş
                </Text>
              </View>
            ) : (
              sekmedekiler.map((k) => (
                <View
                  key={k.malzemeKullanimId}
                  className="mb-2 flex-row items-center rounded-2xl border border-neutral-200 bg-white p-3.5"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-[14px] font-semibold text-neutral-900" numberOfLines={2}>
                      {k.malzemeAdi}
                    </Text>
                    <Text className="mt-0.5 text-[12px] text-neutral-400">
                      {saat(k.verilisTarihi)}
                    </Text>
                  </View>

                  <Text className="mr-3 text-[15px] font-extrabold text-neutral-900">
                    {k.miktar}
                    <Text className="text-[12px] font-semibold text-neutral-400"> kg</Text>
                  </Text>

                  {!saltOkunur && (
                    <Pressable
                      onPress={() => silmeyiSor(k)}
                      accessibilityRole="button"
                      accessibilityLabel="Malzemeyi sil"
                      hitSlop={8}
                      className="h-8 w-8 items-center justify-center rounded-lg active:bg-isdemir-50"
                    >
                      <Ionicons name="trash-outline" size={17} color="#C4131A" />
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>

          {/* işlem butonları - Genel_kullanici görmez (madde 9) */}
          {!saltOkunur && (
            <>
              <View className="mt-8 flex-row gap-3">
                <Pressable
                  onPress={onDuzenle}
                  accessibilityRole="button"
                  accessibilityLabel="Dökümü düzenle"
                  className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl border border-neutral-300 bg-white active:bg-neutral-100"
                >
                  <Ionicons name="create-outline" size={19} color="#404040" />
                  <Text className="ml-1.5 text-[15px] font-bold text-neutral-800">Düzenle</Text>
                </Pressable>

                {sonDokumMu && (
                  <Pressable
                    onPress={dokumSilmeyiSor}
                    accessibilityRole="button"
                    accessibilityLabel="Dökümü sil"
                    className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl border border-isdemir-100 bg-isdemir-50 active:bg-isdemir-100"
                  >
                    <Ionicons name="trash-outline" size={19} color="#C4131A" />
                    <Text className="ml-1.5 text-[15px] font-bold text-isdemir-600">Sil</Text>
                  </Pressable>
                )}
              </View>

              {!sonDokumMu && (
                <Text className="mt-2.5 text-center text-[12px] text-neutral-400">
                  Yalnızca konverterin en son dökümü silinebilir
                </Text>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <MalzemeEkleModal
        acik={ekleAcik}
        dokumId={dokum.dokumId}
        baslangicTuru={sekme}
        onKapat={() => setEkleAcik(false)}
        onEklendi={() => {
          setEkleAcik(false);
          yukle();
        }}
      />
    </View>
  );
}

function SatirBilgi({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[13px] text-neutral-500">{etiket}</Text>
      <Text className="text-[14px] font-semibold text-neutral-900">{deger}</Text>
    </View>
  );
}
