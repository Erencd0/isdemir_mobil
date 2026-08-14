import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Oturum } from './api';
import AnaEkran from './components/AnaEkran';
import GirisEkrani from './components/GirisEkrani';

export default function App() {
  // Oturum yoksa giris ekrani, varsa ana ekran gosterilir.
  // Ekran sayisi artinca burasi react-navigation ile degistirilecek.
  const [oturum, setOturum] = useState<Oturum | null>(null);

  return (
    <SafeAreaProvider>
      {/* Iki ekranin da zemini koyu, saat/pil ikonlari beyaz */}
      <StatusBar style="light" />

      {oturum === null ? (
        <GirisEkrani onGiris={setOturum} />
      ) : (
        <AnaEkran oturum={oturum} onCikis={() => setOturum(null)} />
      )}
    </SafeAreaProvider>
  );
}
