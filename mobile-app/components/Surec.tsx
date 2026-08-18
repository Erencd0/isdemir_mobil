import { Text, View } from 'react-native';
import type { Dokum } from '../api';
import { dakikaFarki, saat, sureMetni } from '../zaman';

/**
 * Bir dokum aslinda bir surectir: hurda sarj -> ana ufleme -> dokum.
 * Web'de bu bes ayri tarih kutusu olarak duruyor ve aralarindaki iliski
 * gorunmuyor. Burada sureyi gorsellestiriyoruz - hangi asama ne kadar
 * surmus, bakinca anlasiliyor.
 */

type Asama = {
  ad: string;
  /** Girilmemis olabilir; zaman yardimcilari null'da "--:--" doner. */
  bas: string | null;
  bit: string | null;
  dakika: number;
  renk: string;
};

/** Dokumun asamalarini ve toplam suresini hesaplar. */
export function asamalariCikar(d: Dokum) {
  const sarj = dakikaFarki(d.hurdaSarjBaslama, d.hurdaSarjBitis);
  const araBir = dakikaFarki(d.hurdaSarjBitis, d.anaUflemeBaslama);
  const ufleme = dakikaFarki(d.anaUflemeBaslama, d.anaUflemeBitis);
  const araIki = dakikaFarki(d.anaUflemeBitis, d.dokumZamani);
  const toplam = dakikaFarki(d.hurdaSarjBaslama, d.dokumZamani);

  const asamalar: Asama[] = [
    {
      ad: 'Hurda Şarj',
      bas: d.hurdaSarjBaslama,
      bit: d.hurdaSarjBitis,
      dakika: sarj,
      renk: 'bg-amber-400',
    },
    {
      ad: 'Ana Üfleme',
      bas: d.anaUflemeBaslama,
      bit: d.anaUflemeBitis,
      dakika: ufleme,
      renk: 'bg-isdemir-500',
    },
  ];

  return { asamalar, sarj, araBir, ufleme, araIki, toplam };
}

/**
 * Liste kartindaki ince surec cubugu.
 * Bolumlerin genisligi gercek surelerle orantili; aradaki bekleme
 * sureleri de gorunur olsun diye acik gri birakiliyor.
 */
export function MiniSurec({ dokum }: { dokum: Dokum }) {
  const { sarj, araBir, ufleme, araIki, toplam } = asamalariCikar(dokum);

  // Toplam hesaplanamiyorsa (bozuk zaman verisi) cubugu hic cizme
  if (toplam <= 0) {
    return <View className="h-1.5 rounded-full bg-neutral-200" />;
  }

  const bolum = (dk: number, sinif: string, anahtar: string) =>
    dk > 0 ? <View key={anahtar} className={sinif} style={{ flexGrow: dk }} /> : null;

  return (
    <View className="h-1.5 flex-row overflow-hidden rounded-full bg-neutral-200">
      {bolum(sarj, 'bg-amber-400', 'sarj')}
      {bolum(araBir, 'bg-neutral-200', 'ara1')}
      {bolum(ufleme, 'bg-isdemir-500', 'ufleme')}
      {bolum(araIki, 'bg-neutral-300', 'ara2')}
    </View>
  );
}

/** Detay ekranindaki dikey zaman cizgisi. */
export function SurecCizgisi({ dokum }: { dokum: Dokum }) {
  const { asamalar, araBir, araIki, toplam } = asamalariCikar(dokum);

  return (
    <View>
      {asamalar.map((asama, i) => (
        <View key={asama.ad}>
          <View className="flex-row">
            {/* sol taraftaki ray ve nokta */}
            <View className="w-6 items-center">
              <View className={'h-3 w-3 rounded-full ' + asama.renk} />
              <View className="w-0.5 flex-1 bg-neutral-200" />
            </View>

            <View className="flex-1 pb-5 pl-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-neutral-900">{asama.ad}</Text>
                <View className="rounded-md bg-neutral-100 px-2 py-0.5">
                  <Text className="text-[12px] font-semibold text-neutral-600">
                    {sureMetni(asama.dakika)}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 text-[13px] text-neutral-500">
                {saat(asama.bas)} → {saat(asama.bit)}
              </Text>
            </View>
          </View>

          {/* asamalar arasindaki bekleme suresi */}
          {i === 0 && araBir > 0 && (
            <View className="flex-row">
              <View className="w-6 items-center">
                <View className="w-0.5 flex-1 bg-neutral-200" />
              </View>
              <View className="flex-1 pb-5 pl-3">
                <Text className="text-[12px] italic text-neutral-400">
                  {sureMetni(araBir)} bekleme
                </Text>
              </View>
            </View>
          )}
        </View>
      ))}

      {araIki > 0 && (
        <View className="flex-row">
          <View className="w-6 items-center">
            <View className="w-0.5 flex-1 bg-neutral-200" />
          </View>
          <View className="flex-1 pb-5 pl-3">
            <Text className="text-[12px] italic text-neutral-400">
              {sureMetni(araIki)} bekleme
            </Text>
          </View>
        </View>
      )}

      {/* son nokta: dokum ani */}
      <View className="flex-row">
        <View className="w-6 items-center">
          <View className="h-3 w-3 rounded-full border-2 border-neutral-900 bg-white" />
        </View>
        <View className="flex-1 pl-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-neutral-900">Döküm</Text>
            <View className="rounded-md bg-neutral-900 px-2 py-0.5">
              <Text className="text-[12px] font-semibold text-white">
                toplam {sureMetni(toplam)}
              </Text>
            </View>
          </View>
          <Text className="mt-1 text-[13px] text-neutral-500">{saat(dokum.dokumZamani)}</Text>
        </View>
      </View>
    </View>
  );
}
