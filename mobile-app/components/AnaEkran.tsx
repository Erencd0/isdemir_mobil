import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Oturum } from '../api';
import IsdemirLogo from './IsdemirLogo';

type Props = {
  oturum: Oturum;
  onCikis: () => void;
};

/**
 * Giris sonrasi acilan ekran. Simdilik yalnizca cikis butonu var;
 * dokum listesi buraya gelecek.
 */
export default function AnaEkran({ oturum, onCikis }: Props) {
  const guvenliAlan = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-kurum-950">
      <LinearGradient
        colors={['#1C1C21', '#0E0E11', '#070708']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View className="absolute -right-16 -top-24 h-[120%] w-[55%] -rotate-[18deg] border-l border-white/[0.07] bg-white/[0.015]" />
      <View className="absolute -left-24 -top-32 h-[120%] w-[40%] rotate-[24deg] border-r border-white/[0.04]" />

      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id="anaAkkor" cx="76%" cy="88%" r="70%">
            <Stop offset="0" stopColor="#FF6A38" stopOpacity="0.42" />
            <Stop offset="0.3" stopColor="#E11D25" stopOpacity="0.26" />
            <Stop offset="1" stopColor="#E11D25" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#anaAkkor)" />
      </Svg>

      <View
        className="flex-1 px-7"
        style={{ paddingTop: guvenliAlan.top + 20, paddingBottom: guvenliAlan.bottom + 24 }}
      >
        <View className="flex-row items-center">
          <IsdemirLogo boyut={56} />
          <Text className="ml-3 text-2xl font-extrabold tracking-tight text-white">İSDEMİR</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-[11px] font-bold tracking-[2.5px] text-isdemir-500">
            DÖKÜM TAKİP SİSTEMİ
          </Text>
          <Text className="mt-3 text-[32px] font-extrabold tracking-tight text-white">
            Hoş geldiniz
          </Text>
          <Text className="mt-1.5 text-[16px] text-white/55">{oturum.kullaniciAdi}</Text>

          <View className="mt-6 flex-row items-center rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="ml-2.5 text-[14px] font-semibold tracking-wide text-white/85">
              {oturum.rol}
            </Text>
          </View>

          <Text className="mt-8 text-center text-[13px] leading-5 text-white/35">
            Döküm listesi ekranı burada olacak.
          </Text>
        </View>

        <Pressable
          onPress={onCikis}
          accessibilityRole="button"
          accessibilityLabel="Çıkış yap"
          className="h-[56px] flex-row items-center justify-center rounded-xl bg-isdemir-500 active:bg-isdemir-600"
          style={{
            shadowColor: '#E11D25',
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text className="text-[17px] font-bold tracking-wide text-white">Çıkış Yap</Text>
        </Pressable>
      </View>
    </View>
  );
}
