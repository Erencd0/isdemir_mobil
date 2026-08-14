import { Text, View } from 'react-native';

/**
 * Sicaklik karti.
 *
 * Web'de sicaklik alanlarinin yaninda sadece "1200-1500" diye bir ipucu
 * yaziyor; deger girildikten sonra aralikta nerede oldugu gorunmuyor.
 * Burada kucuk bir olcek cizip degeri isaretliyoruz - aralik disina
 * cikan bir dokum bakinca fark ediliyor.
 */

type Props = {
  etiket: string;
  deger: number | null | undefined;
  altSinir: number;
  ustSinir: number;
};

export default function SicaklikKarti({ etiket, deger, altSinir, ustSinir }: Props) {
  const gecerli = typeof deger === 'number' && !Number.isNaN(deger);
  const aralikDisi = gecerli && (deger < altSinir || deger > ustSinir);

  // Isaretcinin olcek uzerindeki yeri (%0-100 arasina kirpiliyor)
  const oran = gecerli
    ? Math.min(100, Math.max(0, ((deger - altSinir) / (ustSinir - altSinir)) * 100))
    : 0;

  return (
    <View className="flex-1 rounded-2xl border border-neutral-200 bg-white p-4">
      <Text className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">
        {etiket}
      </Text>

      <View className="mt-1.5 flex-row items-baseline">
        <Text
          className={
            'text-[26px] font-extrabold tracking-tight ' +
            (aralikDisi ? 'text-isdemir-600' : 'text-neutral-900')
          }
        >
          {gecerli ? Math.round(deger) : '-'}
        </Text>
        <Text className="ml-1 text-[15px] font-semibold text-neutral-400">°C</Text>
      </View>

      {/* olcek */}
      <View className="mt-3 h-1.5 rounded-full bg-neutral-100">
        {gecerli && (
          <View
            className={
              'absolute h-3 w-1.5 -translate-y-0.5 rounded-full ' +
              (aralikDisi ? 'bg-isdemir-500' : 'bg-neutral-800')
            }
            style={{ left: `${oran}%` }}
          />
        )}
      </View>

      <View className="mt-1.5 flex-row justify-between">
        <Text className="text-[11px] text-neutral-400">{altSinir}</Text>
        {aralikDisi ? (
          <Text className="text-[11px] font-semibold text-isdemir-600">aralık dışı</Text>
        ) : null}
        <Text className="text-[11px] text-neutral-400">{ustSinir}</Text>
      </View>
    </View>
  );
}
