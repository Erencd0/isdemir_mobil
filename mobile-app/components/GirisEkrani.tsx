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

type Props = {
  /** Giris basarili olunca oturum bilgisiyle cagrilir; App.tsx ana ekrana gecer. */
  onGiris: (oturum: api.Oturum) => void;
};

export default function GirisEkrani({ onGiris }: Props) {
  const { width, height } = useWindowDimensions();
  const guvenliAlan = useSafeAreaInsets();

  // Tablet / yatay ekranda tasarim iki sutuna ayrilir, telefonda alt alta gelir.
  const genisEkran = width >= 900;

  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [rol, setRol] = useState('');
  const [parola, setParola] = useState('');
  const [roller, setRoller] = useState<string[]>([]);
  const [rolMetni, setRolMetni] = useState('Önce bilgilerinizi kontrol edin');
  const [parolaGizli, setParolaGizli] = useState(true);

  /**
   * Giris iki asamali:
   *   'kontrol' -> kullanici adi + parola dogrulanir, roller gelir
   *   'giris'   -> rol secilir ve giris yapilir
   */
  const [asama, setAsama] = useState<'kontrol' | 'giris'>('kontrol');
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

  /**
   * Kullanici adi veya parola degistiginde yapilan dogrulama gecersizlesir:
   * kontrol asamasina donulur, roller temizlenir. Aksi halde kullanici
   * dogrulamadan sonra parolayi degistirip giris yapabilirdi.
   */
  function bilgiDegisti(alan: 'kod' | 'parola', deger: string) {
    if (alan === 'kod') setKullaniciAdi(deger);
    else setParola(deger);

    if (asama === 'giris') {
      setAsama('kontrol');
      setRoller([]);
      setRol('');
      setRolMetni('Önce bilgilerinizi kontrol edin');
      setMesaj(null);
    }
  }

  /** 1. asama: kullanici adi + parolayi dogrula, tanimli rolleri getir. */
  async function kontrolEt() {
    klavyeyiKapat();

    if (!kullaniciAdi.trim()) {
      setMesaj({ metin: 'Kullanıcı adınızı giriniz', basarili: false });
      return;
    }
    if (!parola) {
      setMesaj({ metin: 'Parolanızı giriniz', basarili: false });
      return;
    }

    setYukleniyor(true);
    setMesaj(null);

    try {
      const gelen = await api.kimlikKontrol({ kullaniciAdi: kullaniciAdi.trim(), parola });

      if (!gelen.roller || gelen.roller.length === 0) {
        setRolMetni('Tanımlı rol yok');
        setMesaj({
          metin: 'Bu kullanıcıya tanımlı konverter / rol yok. Yöneticinize başvurun.',
          basarili: false,
        });
        return;
      }

      setRoller(gelen.roller);
      setRolMetni('Rol seçiniz');
      setAsama('giris');
      setMesaj({
        metin: 'Bilgileriniz doğrulandı. Konverter / rol seçip giriş yapın.',
        basarili: true,
      });
    } catch (err) {
      setMesaj({ metin: (err as Error).message, basarili: false });
    } finally {
      setYukleniyor(false);
    }
  }

  /** 2. asama: secilen rol ile giris yap. Kimlik bu noktada dogrulanmis durumda. */
  async function girisYap() {
    klavyeyiKapat();

    if (!rol) {
      setMesaj({ metin: 'Lütfen konverter / rol seçiniz', basarili: false });
      return;
    }

    setYukleniyor(true);
    setMesaj(null);

    try {
      const data = await api.girisYap({ kullaniciAdi: kullaniciAdi.trim(), parola, rol });
      setMesaj({
        metin:
          'Hoş geldiniz, ' + data.kullanici.kullaniciAdi + ' (' + data.kullanici.rol + ')',
        basarili: true,
      });

      // Basari mesaji bir an gorunsun, sonra ana ekrana gec.
      setTimeout(() => {
        onGiris({
          kullaniciAdi: data.kullanici.kullaniciAdi,
          rol: data.kullanici.rol,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }, 700);

      // TODO: Token'lari expo-secure-store ile cihazda saklayin.
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
      <Text className="mb-2 mt-6 text-[13px] font-semibold text-neutral-700">Kullanıcı Adı</Text>
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
          value={kullaniciAdi}
          onChangeText={(metin) => bilgiDegisti('kod', metin)}
          onFocus={() => setOdak('kod')}
          onBlur={() => setOdak(null)}
          placeholder="Kullanıcı adınızı girin"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={klavyeyiKapat}
          className="ml-2.5 h-full flex-1 text-[15px] text-neutral-900"
        />
      </View>

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
          onChangeText={(metin) => bilgiDegisti('parola', metin)}
          onFocus={() => setOdak('parola')}
          onBlur={() => setOdak(null)}
          placeholder="Parolanızı girin"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={parolaGizli}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={asama === 'kontrol' ? kontrolEt : girisYap}
          className="ml-2.5 h-full flex-1 text-[15px] text-neutral-900"
        />
        <Pressable onPress={() => setParolaGizli(!parolaGizli)} hitSlop={10}>
          <Ionicons name={parolaGizli ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* ---------- konverter / rol (kimlik dogrulanana kadar kilitli) ---------- */}
      <Text className="mb-2 mt-4 text-[13px] font-semibold text-neutral-700">Konverter / Rol</Text>
      <RolSecici deger={rol} secenekler={roller} bosMetin={rolMetni} onSec={setRol} />

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
        onPress={asama === 'kontrol' ? kontrolEt : girisYap}
        disabled={yukleniyor}
        accessibilityRole="button"
        accessibilityLabel={asama === 'kontrol' ? 'Bilgileri kontrol et' : 'Giriş yap'}
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
          <>
            {asama === 'giris' && (
              <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text className="text-[17px] font-bold tracking-wide text-white">
              {asama === 'kontrol' ? 'Kontrol Et' : 'Giriş Yap'}
            </Text>
          </>
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
        {/* Mesaj kutusu acildiginda veya kucuk ekranda ust bant kisalir */}
        <HeroPanel
          genisEkran={false}
          ustBosluk={guvenliAlan.top}
          kompakt={!!mesaj || height < 780}
        />

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
