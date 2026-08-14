import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import IsdemirLogo from './IsdemirLogo';

type Props = {
  /** Tablet / yatay ekranda sol sutun olarak calisir, telefonda ust bant olur. */
  genisEkran: boolean;
  /** Centik (notch) yuksekligi - icerigi asagi iter. */
  ustBosluk: number;
  /**
   * Alan daraldiginda (form mesaj kutusu acildiginda ya da kucuk ekranlarda)
   * alt aciklama gizlenir. Yoksa metin form kagidinin altinda kalip kesiliyor.
   */
  kompakt?: boolean;
};

export default function HeroPanel({ genisEkran, ustBosluk, kompakt = false }: Props) {
  const aciklamaGoster = genisEkran || !kompakt;
  return (
    // flex-1: formdan artan alani doldurur, boylece ekran kaydirmadan tam oturur
    <View
      className="flex-1 overflow-hidden"
      style={{ paddingTop: ustBosluk + (genisEkran ? 48 : 20) }}
    >
      {/* ---------- arka plan katmanlari ---------- */}
      <LinearGradient
        colors={['#1C1C21', '#0E0E11', '#070708']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* celik plaka hissi veren capraz seritler */}
      <View className="absolute -right-16 -top-24 h-[160%] w-[55%] -rotate-[18deg] border-l border-white/[0.07] bg-white/[0.015]" />
      <View className="absolute -right-40 -top-24 h-[160%] w-[45%] -rotate-[18deg] border-l border-white/[0.05]" />
      <View className="absolute -left-24 -top-32 h-[150%] w-[40%] rotate-[24deg] border-r border-white/[0.04]" />

      {/* sag altta akkor kirmizi parlama - kenari olmayan yumusak gecis icin SVG radial gradient */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <RadialGradient id="akkor" cx="76%" cy="92%" r="70%">
            <Stop offset="0" stopColor="#FF6A38" stopOpacity="0.5" />
            <Stop offset="0.28" stopColor="#E11D25" stopOpacity="0.3" />
            <Stop offset="0.6" stopColor="#B01118" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#E11D25" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="kor" cx="88%" cy="99%" r="34%">
            <Stop offset="0" stopColor="#FF8A4C" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#FF5A2C" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#akkor)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#kor)" />
      </Svg>

      {/* ---------- icerik ---------- */}
      {/* pb-14: form kagidi -32px yukari bindigi icin alt yazi gizlenmesin diye pay birakiliyor */}
      <View className={'flex-1 justify-between ' + (genisEkran ? 'px-12 pb-4' : 'px-7 pb-14')}>
        <View className="flex-row items-center">
          <IsdemirLogo boyut={genisEkran ? 72 : 56} />
          <Text
            className={
              'ml-3 font-extrabold tracking-tight text-white ' +
              (genisEkran ? 'text-4xl' : 'text-2xl')
            }
          >
            İSDEMİR
          </Text>
        </View>

        <View>
          <Text className="text-[11px] font-bold tracking-[2.5px] text-isdemir-500">
            ÇELİKHANE OPERASYONLARI
          </Text>

          <Text
            className={
              'mt-4 font-extrabold tracking-tight text-white ' +
              (genisEkran ? 'text-[52px] leading-[58px]' : 'text-[32px] leading-[38px]')
            }
          >
            Üretimin her adımı{'\n'}tek ekranda.
          </Text>

          {aciklamaGoster && (
            <Text
              className={
                'mt-4 text-white/45 ' +
                (genisEkran ? 'max-w-[420px] text-lg leading-7' : 'text-[15px] leading-[22px]')
              }
            >
              Döküm süreçlerini güvenli, hızlı ve kesintisiz olarak takip edin.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
