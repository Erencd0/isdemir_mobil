import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';

type Props = {
  acik: boolean;
  /** null ise kayit atilmaz, secim onSecim ile geri verilir (yeni dokum formu). */
  dokumId: number | null;
  /** Detaydaki acik sekme - modal ayni turle acilsin diye */
  baslangicTuru: string;
  onKapat: () => void;
  onEklendi: () => void;
  /** Verilirse malzeme sunucuya yazilmaz, cagirana teslim edilir. */
  onSecim?: (tanim: api.MalzemeTanim, miktar: number) => void;
};

/**
 * Dokume malzeme ekleme sayfasi.
 *
 * Katalogda 101 malzeme var; web'de bunlarin hepsi tek bir <select> icinde
 * duruyor. Telefonda o liste kullanilamaz, bu yuzden arama kutusu koyduk -
 * kullanici malzeme adinin bir parcasini yazip buluyor.
 */
export default function MalzemeEkleModal({
  acik,
  dokumId,
  baslangicTuru,
  onKapat,
  onEklendi,
  onSecim,
}: Props) {
  const guvenliAlan = useSafeAreaInsets();

  const [tur, setTur] = useState(baslangicTuru);
  const [tanimlar, setTanimlar] = useState<api.MalzemeTanim[] | null>(null);
  const [arama, setArama] = useState('');
  const [secili, setSecili] = useState<api.MalzemeTanim | null>(null);
  const [miktar, setMiktar] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Modal her acildiginda temiz baslasin
  useEffect(() => {
    if (acik) {
      setTur(baslangicTuru);
      setArama('');
      setSecili(null);
      setMiktar('');
      setHata(null);
    }
  }, [acik, baslangicTuru]);

  const tanimlariYukle = useCallback(async (hangiTur: string) => {
    setTanimlar(null);
    try {
      setTanimlar(await api.malzemeTanimlariGetir(hangiTur));
    } catch (err) {
      setHata((err as Error).message);
      setTanimlar([]);
    }
  }, []);

  useEffect(() => {
    if (acik) tanimlariYukle(tur);
  }, [acik, tur, tanimlariYukle]);

  const suzulmus = (tanimlar ?? []).filter((t) => {
    if (!arama.trim()) return true;
    const q = arama.trim().toLocaleLowerCase('tr');
    return (
      t.malzemeAdi.toLocaleLowerCase('tr').includes(q) || String(t.malzemeKodu).includes(q)
    );
  });

  async function ekle() {
    if (!secili) {
      setHata('Malzeme seçiniz');
      return;
    }
    const sayi = Number(miktar.replace(',', '.'));
    if (!miktar.trim() || Number.isNaN(sayi) || sayi <= 0) {
      setHata('Miktar sıfırdan büyük olmalıdır');
      return;
    }

    // Yeni dokum formunda dokum henuz yok: kaydetmeyip listeye ekliyoruz
    if (onSecim || dokumId === null) {
      onSecim?.(secili, sayi);
      return;
    }

    setKaydediliyor(true);
    setHata(null);
    try {
      await api.malzemeEkle({ dokumId, malzemeId: secili.malzemeId, miktar: sayi });
      onEklendi();
    } catch (err) {
      setHata((err as Error).message);
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <Modal visible={acik} animationType="slide" onRequestClose={onKapat} presentationStyle="pageSheet">
      <KeyboardAvoidingView
        className="flex-1 bg-neutral-50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* başlık */}
        <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
          <Text className="text-[17px] font-extrabold tracking-tight text-neutral-900">
            Malzeme Ekle
          </Text>
          <Pressable
            onPress={onKapat}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={10}
            className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200"
          >
            <Ionicons name="close" size={18} color="#525252" />
          </Pressable>
        </View>

        <View className="px-5 pt-4">
          {/* katkı türü */}
          <View className="flex-row rounded-xl bg-neutral-200/70 p-1">
            {api.KATKI_TURLERI.map((t) => {
              const seciliTur = tur === t.deger;
              return (
                <Pressable
                  key={t.deger}
                  onPress={() => {
                    setTur(t.deger);
                    setSecili(null);
                  }}
                  accessibilityRole="button"
                  className={
                    'flex-1 items-center rounded-lg py-2 ' + (seciliTur ? 'bg-white' : '')
                  }
                >
                  <Text
                    className={
                      'text-[13px] font-semibold ' +
                      (seciliTur ? 'text-neutral-900' : 'text-neutral-500')
                    }
                  >
                    {t.ad}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* arama */}
          <View className="mt-4 h-[48px] flex-row items-center rounded-xl border border-neutral-200 bg-white px-3.5">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={arama}
              onChangeText={setArama}
              placeholder="Malzeme adı veya kodu ara"
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              className="ml-2 h-full flex-1 text-[15px] text-neutral-900"
            />
            {arama.length > 0 && (
              <Pressable onPress={() => setArama('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color="#C4C4C8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* liste */}
        <View className="mt-3 flex-1 px-5">
          {tanimlar === null ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#E11D25" />
            </View>
          ) : (
            <FlatList
              data={suzulmus}
              keyExtractor={(t) => String(t.malzemeId)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text className="pt-8 text-center text-[13px] text-neutral-400">
                  Eşleşen malzeme yok
                </Text>
              }
              renderItem={({ item }) => {
                const isaretli = secili?.malzemeId === item.malzemeId;
                return (
                  <Pressable
                    onPress={() => setSecili(item)}
                    accessibilityRole="button"
                    className={
                      'mb-2 flex-row items-center rounded-xl border px-3.5 py-3 ' +
                      (isaretli
                        ? 'border-isdemir-500 bg-isdemir-50'
                        : 'border-neutral-200 bg-white')
                    }
                  >
                    <View className="flex-1 pr-2">
                      <Text
                        className={
                          'text-[14px] ' +
                          (isaretli ? 'font-bold text-isdemir-700' : 'text-neutral-800')
                        }
                        numberOfLines={2}
                      >
                        {item.malzemeAdi}
                      </Text>
                      <Text className="mt-0.5 text-[12px] text-neutral-400">
                        kod {item.malzemeKodu}
                      </Text>
                    </View>
                    {isaretli && <Ionicons name="checkmark-circle" size={20} color="#E11D25" />}
                  </Pressable>
                );
              }}
            />
          )}
        </View>

        {/* alt panel: miktar + ekle */}
        <View
          className="border-t border-neutral-200 bg-white px-5 pt-4"
          style={{ paddingBottom: guvenliAlan.bottom + 14 }}
        >
          {hata && (
            <View className="mb-3 flex-row items-center rounded-xl bg-isdemir-50 px-3.5 py-2.5">
              <Ionicons name="alert-circle" size={17} color="#E11D25" />
              <Text className="ml-2 flex-1 text-[13px] text-isdemir-700">{hata}</Text>
            </View>
          )}

          <View className="flex-row items-center">
            <View className="h-[52px] flex-1 flex-row items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3.5">
              <TextInput
                value={miktar}
                onChangeText={setMiktar}
                placeholder="Miktar"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="h-full flex-1 text-[16px] font-semibold text-neutral-900"
              />
              <Text className="text-[14px] font-semibold text-neutral-400">kg</Text>
            </View>

            <Pressable
              onPress={ekle}
              disabled={kaydediliyor}
              accessibilityRole="button"
              accessibilityLabel="Malzemeyi ekle"
              className={
                'ml-3 h-[52px] flex-row items-center justify-center rounded-xl bg-isdemir-500 px-6 active:bg-isdemir-600 ' +
                (kaydediliyor ? 'opacity-70' : '')
              }
            >
              {kaydediliyor ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[16px] font-bold text-white">Ekle</Text>
              )}
            </Pressable>
          </View>

          {secili && (
            <Text className="mt-2.5 text-[12px] text-neutral-500" numberOfLines={1}>
              Seçili: {secili.malzemeAdi}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
