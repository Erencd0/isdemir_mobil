import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  deger: string;
  secenekler: string[];
  /** Secim yokken kutuda gorunecek yazi (orn. "Önce kullanıcı kodu giriniz") */
  bosMetin: string;
  onSec: (rol: string) => void;
};

/**
 * React Native'de hazir bir <select> yok; bu yuzden kutuya basinca
 * alttan acilan bir liste gosteriyoruz.
 */
export default function RolSecici({ deger, secenekler, bosMetin, onSec }: Props) {
  const [acik, setAcik] = useState(false);
  const pasif = secenekler.length === 0;

  return (
    <>
      <Pressable
        onPress={() => !pasif && setAcik(true)}
        accessibilityRole="button"
        accessibilityLabel="Konverter veya rol seç"
        className={
          'h-[54px] flex-row items-center rounded-xl border px-3.5 ' +
          (pasif ? 'border-neutral-200 bg-neutral-100' : 'border-neutral-200 bg-white')
        }
      >
        <Ionicons name="people-outline" size={19} color={pasif ? '#C4C4C8' : '#9CA3AF'} />
        <Text
          className={
            'ml-2.5 flex-1 text-[15px] ' + (deger ? 'text-neutral-900' : 'text-neutral-400')
          }
        >
          {deger || bosMetin}
        </Text>
        <Ionicons name="chevron-down" size={18} color={pasif ? '#C4C4C8' : '#9CA3AF'} />
      </Pressable>

      <Modal visible={acik} transparent animationType="fade" onRequestClose={() => setAcik(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setAcik(false)}
        >
          <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5">
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-neutral-300" />
            <Text className="mb-3 text-[13px] font-bold tracking-[1.5px] text-neutral-500">
              KONVERTER / ROL SEÇİN
            </Text>

            {secenekler.map((rol) => {
              const secili = rol === deger;
              return (
                <Pressable
                  key={rol}
                  onPress={() => {
                    onSec(rol);
                    setAcik(false);
                  }}
                  className={
                    'mb-2 flex-row items-center rounded-xl border px-4 py-4 ' +
                    (secili ? 'border-isdemir-500 bg-isdemir-50' : 'border-neutral-200 bg-white')
                  }
                >
                  <Text
                    className={
                      'flex-1 text-[15px] ' +
                      (secili ? 'font-semibold text-isdemir-600' : 'text-neutral-800')
                    }
                  >
                    {rol}
                  </Text>
                  {secili && <Ionicons name="checkmark-circle" size={20} color="#E11D25" />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
