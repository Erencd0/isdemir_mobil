import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GirisEkrani from './components/GirisEkrani';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Ust bant koyu oldugu icin saat/pil ikonlari beyaz */}
      <StatusBar style="light" />
      <GirisEkrani />
    </SafeAreaProvider>
  );
}
