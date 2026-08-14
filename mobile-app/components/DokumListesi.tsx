import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';
import { bugunMu, saat, sureMetni, tarih } from '../zaman';
import IsdemirLogo from './IsdemirLogo';
import { MiniSurec, asamalariCikar } from './Surec';

type Props = {
  oturum: api.Oturum;
  onCikis: () => void;
  onDokumSec: (dokum: api.Dokum) => void;
  onYeniDokum: () => void;
  /** Liste her yuklendiginde App'e bildirilir; en son dokum oradan takip ediliyor. */
  onListeYuklendi: (dokumler: api.Dokum[]) => void;
};

export default function DokumListesi({
  oturum,
  onCikis,
  onDokumSec,
  onYeniDokum,
  onListeYuklendi,
}: Props) {
  const guvenliAlan = useSafeAreaInsets();
  const saltOkunur = api.saltOkunur(oturum.rol);

  const [dokumler, setDokumler] = useState<api.Dokum[] | null>(null);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    try {
      const gelen = await api.dokumleriGetir();
      // En yeni dokum ustte olsun - vardiyada en cok bakilan kayit odur
      const sirali = [...gelen].sort((a, b) => b.dokumId - a.dokumId);
      setDokumler(sirali);
      onListeYuklendi(sirali);
      setHata(null);
    } catch (err) {
      setHata((err as Error).message);
      setDokumler([]);
    }
  }, [onListeYuklendi]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  async function elleYenile() {
    setYenileniyor(true);
    await yukle();
    setYenileniyor(false);
  }

  return (
    <View className="flex-1 bg-kurum-950">
      {/* ---------- koyu ust bant ---------- */}
      <View style={{ paddingTop: guvenliAlan.top + 14 }} className="overflow-hidden pb-6">
        <LinearGradient
          colors={['#1C1C21', '#0E0E11', '#070708']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
          <Defs>
            <RadialGradient id="listeAkkor" cx="82%" cy="95%" r="65%">
              <Stop offset="0" stopColor="#FF6A38" stopOpacity="0.38" />
              <Stop offset="0.35" stopColor="#E11D25" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#E11D25" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#listeAkkor)" />
        </Svg>

        <View className="flex-row items-center justify-between px-6">
          <View className="flex-row items-center">
            <IsdemirLogo boyut={40} />
            <Text className="ml-2 text-lg font-extrabold tracking-tight text-white">İSDEMİR</Text>
          </View>

          <Pressable
            onPress={onCikis}
            accessibilityRole="button"
            accessibilityLabel="Çıkış yap"
            hitSlop={8}
            className="h-9 flex-row items-center rounded-full border border-white/20 bg-white/[0.08] px-3.5 active:bg-white/20"
          >
            <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-[14px] font-semibold text-white">Çıkış Yap</Text>
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center px-6">
          <View className="rounded-lg bg-isdemir-500 px-2.5 py-1">
            <Text className="text-[13px] font-extrabold uppercase tracking-wider text-white">
              {oturum.rol}
            </Text>
          </View>
          <Text className="ml-2.5 text-[15px] text-white/60">{oturum.kullaniciAdi}</Text>
        </View>
      </View>

      {/* ---------- beyaz sayfa ---------- */}
      <View className="-mt-4 flex-1 rounded-t-[28px] bg-neutral-50 px-5 pt-5">
        {!saltOkunur && (
          <Pressable
            onPress={onYeniDokum}
            accessibilityRole="button"
            accessibilityLabel="Yeni döküm ekle"
            className="h-[52px] flex-row items-center justify-center rounded-xl bg-isdemir-500 active:bg-isdemir-600"
            style={{
              shadowColor: '#E11D25',
              shadowOpacity: 0.28,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 5,
            }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text className="ml-1.5 text-[16px] font-bold text-white">Yeni Döküm</Text>
          </Pressable>
        )}

        <View className={'mb-3 flex-row items-baseline justify-between ' + (saltOkunur ? '' : 'mt-6')}>
          <Text className="text-[17px] font-extrabold tracking-tight text-neutral-900">
            Dökümler
          </Text>
          {dokumler !== null && (
            <Text className="text-[13px] text-neutral-500">{dokumler.length} kayıt</Text>
          )}
        </View>

        {dokumler === null ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color="#E11D25" />
          </View>
        ) : (
          <FlatList
            data={dokumler}
            keyExtractor={(d) => String(d.dokumId)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: guvenliAlan.bottom + 24 }}
            refreshControl={
              <RefreshControl
                refreshing={yenileniyor}
                onRefresh={elleYenile}
                tintColor="#E11D25"
              />
            }
            ListEmptyComponent={
              <View className="items-center pt-14">
                <Ionicons
                  name={hata ? 'cloud-offline-outline' : 'documents-outline'}
                  size={40}
                  color="#C4C4C8"
                />
                <Text className="mt-3 px-6 text-center text-[14px] leading-5 text-neutral-500">
                  {hata ?? 'Bu konverterde henüz döküm kaydı yok.'}
                </Text>
                {hata && (
                  <Pressable
                    onPress={elleYenile}
                    accessibilityRole="button"
                    className="mt-4 rounded-lg border border-neutral-300 px-4 py-2 active:bg-neutral-100"
                  >
                    <Text className="text-[14px] font-semibold text-neutral-700">Tekrar dene</Text>
                  </Pressable>
                )}
              </View>
            }
            renderItem={({ item }) => <DokumKarti dokum={item} onBas={() => onDokumSec(item)} />}
          />
        )}
      </View>
    </View>
  );
}

/** Listedeki tek dokum karti. */
function DokumKarti({ dokum, onBas }: { dokum: api.Dokum; onBas: () => void }) {
  const { toplam } = asamalariCikar(dokum);

  return (
    <Pressable
      onPress={onBas}
      accessibilityRole="button"
      accessibilityLabel={'Döküm ' + dokum.dokumNo}
      className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-[17px] font-extrabold tracking-tight text-neutral-900">
          #{dokum.dokumNo}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-[13px] font-semibold text-neutral-600">
            {bugunMu(dokum.dokumZamani) ? 'Bugün' : tarih(dokum.dokumZamani)}
          </Text>
          <Text className="ml-1.5 text-[13px] text-neutral-400">{saat(dokum.dokumZamani)}</Text>
        </View>
      </View>

      <View className="mt-3">
        <MiniSurec dokum={dokum} />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="thermometer-outline" size={15} color="#9CA3AF" />
          <Text className="ml-1 text-[13px] font-semibold text-neutral-700">
            {Math.round(dokum.shdSicaklik)}° → {Math.round(dokum.dokumSicaklik)}°
          </Text>
          <Text className="ml-3 text-[13px] text-neutral-400">{sureMetni(toplam)}</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="mr-1 text-[13px] text-neutral-500" numberOfLines={1}>
            {dokum.operatorAdSoyad}
          </Text>
          <Ionicons name="chevron-forward" size={15} color="#C4C4C8" />
        </View>
      </View>
    </Pressable>
  );
}
