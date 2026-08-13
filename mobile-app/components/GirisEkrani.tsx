import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../api';
import HeroPanel from './HeroPanel';
import RolSecici from './RolSecici';

type Mesaj = { metin: string; basarili: boolean };

export default function GirisEkrani() {
  const { width } = useWindowDimensions();
  const guvenliAlan = useSafeAreaInsets();

  // Tablet / yatay ekranda tasarim iki sutuna ayrilir, telefonda alt alta gelir.
  const genisEkran = width >= 900;

  const [kullaniciKodu, setKullaniciKodu] = useState('');
  const [rol, setRol] = useState('');
  const [parola, setParola] = useState('');
  const [roller, setRoller] = useState<string[]>([]);
  const [rolMetni, setRolMetni] = useState('Önce kullanıcı kodu giriniz');
  const [parolaGizli, setParolaGizli] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<Mesaj | null>(null);
  const [odak, setOdak] = useState<'kod' | 'parola' | null>(null);

  const kodAlani = useRef<TextInput>(null);
  const parolaAlani = useRef<TextInput>(null);

  /**
   * Keyboard.dismiss() tek basina yetmiyor: iOS'ta klavye kapaniyor ama alan
   * odakta kaliyor, dolayisiyla onBlur tetiklenmiyor ve cerceve kirmizi kaliyor.
   * Bu yuzden alanlari acikca blur ediyoruz.
   */
  function klavyeyiKapat() {
    kodAlani.current?.blur();
    parolaAlani.current?.blur();
    Keyboard.dismiss();
  }

  /** Kullanici kodu alanindan cikildiginda o kullaniciya ait rolleri yukle. */
  async function rolleriYukle() {
    setOdak(null);
    const kod = kullaniciKodu.trim();
    setRol('');
    setRoller([]);

    if (!kod) {
      setRolMetni('Önce kullanıcı kodu giriniz');
      return;
    }

    setRolMetni('Roller yükleniyor...');
    try {
      const gelen = await api.rolleriGetir(kod);
      setRoller(gelen);
      setRolMetni(gelen.length === 0 ? 'Tanımlı rol yok' : 'Rol seçiniz');
      setMesaj(null);
    } catch {
      setRolMetni('Roller yüklenemedi');
    }
  }

  async function girisYap() {
    if (!kullaniciKodu.trim()) {
      setMesaj({ metin: 'Kullanıcı kodunuzu giriniz', basarili: false });
      return;
    }
    if (!rol) {
      setMesaj({ metin: 'Lütfen konverter / rol seçiniz', basarili: false });
      return;
    }
    if (!parola) {
      setMesaj({ metin: 'Parolanızı giriniz', basarili: false });
      return;
    }

    setYukleniyor(true);
    setMesaj(null);

    try {
      const data = await api.girisYap({ kullaniciKodu: kullaniciKodu.trim(), parola, rol });
      setMesaj({
        metin: 'Hoş geldiniz, ' + (data.kullaniciAdi || kullaniciKodu) + ' (' + data.rol + ')',
        basarili: true,
      });

      // TODO: Oturumu kaydedip döküm ekranina yonlendirin.
      // Web tarafinda bu is oturum.js + navigate('/dokum') ile yapiliyor.
    } catch (err) {
      setMesaj({ metin: (err as Error).message, basarili: false });
    } finally {
      setYukleniyor(false);
    }
  }

  const form = (
    <View>
      <View className="items-center">
        <Text className="text-[12px] font-bold tracking-[2px] text-isdemir-500">
          DÖKÜM TAKİP SİSTEMİ
        </Text>
        <Text
          className={
            'mt-2.5 font-extrabold tracking-tight text-neutral-900 ' +
            (genisEkran ? 'text-[38px]' : 'text-[30px]')
          }
        >
          Hoş geldiniz
        </Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-neutral-500">
          Devam etmek için kurumsal bilgilerinizle giriş yapın.
        </Text>
      </View>

      {/* ---------- kullanici kodu ---------- */}
      <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">Kullanıcı Kodu</Text>
      <View
        className={
          'h-[54px] flex-row items-center rounded-xl border bg-white px-3.5 ' +
          (odak === 'kod' ? 'border-isdemir-500' : 'border-neutral-200')
        }
      >
        <Ionicons
          name="person-outline"
          size={19}
          color={odak === 'kod' ? '#E11D25' : '#9CA3AF'}
        />
        <TextInput
          ref={kodAlani}
          value={kullaniciKodu}
          onChangeText={setKullaniciKodu}
          onFocus={() => setOdak('kod')}
          onBlur={rolleriYukle}
          placeholder="Kullanıcı kodunuzu girin"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={klavyeyiKapat}
          className="ml-2.5 h-full flex-1 text-[15px] text-neutral-900"
        />
      </View>

      {/* ---------- konverter / rol ---------- */}
      <Text className="mb-2 mt-4 text-[13px] font-semibold text-neutral-700">Konverter / Rol</Text>
      <RolSecici deger={rol} secenekler={roller} bosMetin={rolMetni} onSec={setRol} />

      {/* ---------- parola ---------- */}
      <Text className="mb-2 mt-4 text-[13px] font-semibold text-neutral-700">Parola</Text>
      <View
        className={
          'h-[54px] flex-row items-center rounded-xl border bg-white px-3.5 ' +
          (odak === 'parola' ? 'border-isdemir-500' : 'border-neutral-200')
        }
      >
        <Ionicons
          name="lock-closed-outline"
          size={19}
          color={odak === 'parola' ? '#E11D25' : '#9CA3AF'}
        />
        <TextInput
          ref={parolaAlani}
          value={parola}
          onChangeText={setParola}
          onFocus={() => setOdak('parola')}
          onBlur={() => setOdak(null)}
          placeholder="Parolanızı girin"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={parolaGizli}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={girisYap}
          className="ml-2.5 h-full flex-1 text-[15px] text-neutral-900"
        />
        <Pressable onPress={() => setParolaGizli(!parolaGizli)} hitSlop={10}>
          <Ionicons name={parolaGizli ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* ---------- hata / basari mesaji ---------- */}
      {mesaj && (
        <View
          className={
            'mt-4 flex-row items-center rounded-xl px-4 py-3 ' +
            (mesaj.basarili ? 'bg-emerald-50' : 'bg-isdemir-50')
          }
        >
          <Ionicons
            name={mesaj.basarili ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={mesaj.basarili ? '#059669' : '#E11D25'}
          />
          <Text
            className={
              'ml-2 flex-1 text-[13px] leading-[18px] ' +
              (mesaj.basarili ? 'text-emerald-700' : 'text-isdemir-700')
            }
          >
            {mesaj.metin}
          </Text>
        </View>
      )}

      {/* ---------- giris butonu ---------- */}
      <Pressable
        onPress={girisYap}
        disabled={yukleniyor}
        accessibilityRole="button"
        accessibilityLabel="Giriş yap"
        className={
          'mt-5 h-[56px] flex-row items-center justify-center rounded-xl bg-isdemir-500 active:bg-isdemir-600 ' +
          (yukleniyor ? 'opacity-70' : '')
        }
        style={{
          shadowColor: '#E11D25',
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        {yukleniyor ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-[17px] font-bold tracking-wide text-white">Giriş Yap</Text>
        )}
      </Pressable>

      <View className="mt-4 flex-row items-center justify-center">
        <View className="h-2 w-2 rounded-full bg-emerald-500" />
        <Text className="ml-2 text-[13px] text-neutral-500">Güvenli kurumsal erişim</Text>
      </View>
    </View>
  );

  // ---------- tablet / yatay: iki sutun ----------
  if (genisEkran) {
    return (
      <View className="flex-1 flex-row bg-neutral-50">
        <HeroPanel genisEkran ustBosluk={guvenliAlan.top} />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full max-w-[420px] self-center">{form}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ---------- telefon: ust bant + alttan gelen form kagidi ----------
  // Kaydirma yok: ust bant flex-1 ile artan alani doldurur, form kendi boyunda kalir.
  // Klavye acilinca ust bant kisilir, form gorunur kalmaya devam eder.
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-kurum-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Kaydirma olmadigi icin bosluga dokununca klavye kapansin diye sarmalayici */}
      <Pressable className="flex-1" onPress={klavyeyiKapat} accessible={false}>
        <HeroPanel genisEkran={false} ustBosluk={guvenliAlan.top} />

        <View
          className="-mt-8 rounded-t-[32px] bg-neutral-50 px-7 pt-7"
          style={{ paddingBottom: guvenliAlan.bottom + 16 }}
        >
          {form}
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
