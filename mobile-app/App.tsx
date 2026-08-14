import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as api from './api';
import DokumDetay from './components/DokumDetay';
import DokumFormu from './components/DokumFormu';
import DokumListesi from './components/DokumListesi';
import GirisEkrani from './components/GirisEkrani';

/**
 * Hangi ekranin acik oldugu.
 * Ekran sayisi arttikca burasi react-navigation ile degistirilecek;
 * dort ekran icin kutuphane kurmak henuz gereksiz agirlik.
 */
type Ekran =
  | { ad: 'liste' }
  | { ad: 'detay'; dokum: api.Dokum }
  | { ad: 'yeni' }
  | { ad: 'duzenle'; dokum: api.Dokum };

export default function App() {
  const [oturum, setOturum] = useState<api.Oturum | null>(null);
  const [ekran, setEkran] = useState<Ekran>({ ad: 'liste' });

  /**
   * Konverterin en son dokumu. Iki yerde lazim:
   *   - yeni dokum formunda "onceki dokum su saatte bitti" uyarisi (madde 1)
   *   - detayda sil butonunun gorunup gorunmeyecegi (madde 5)
   * Liste her yuklendiginde tazeleniyor.
   */
  const [sonDokum, setSonDokum] = useState<api.Dokum | null>(null);

  function girisYapildi(yeniOturum: api.Oturum) {
    api.tokenAyarla(yeniOturum.accessToken);
    setOturum(yeniOturum);
    setEkran({ ad: 'liste' });
  }

  function cikisYap() {
    api.tokenAyarla(null);
    setOturum(null);
    setSonDokum(null);
  }

  const listeye = () => setEkran({ ad: 'liste' });

  /**
   * useCallback sart: her render'da yeni fonksiyon gecseydi DokumListesi'ndeki
   * yukleme etkisi surekli yeniden tetiklenir, sonsuz istek dongusune girerdi.
   */
  const listeYuklendi = useCallback((dokumler: api.Dokum[]) => {
    setSonDokum(dokumler[0] ?? null);
  }, []);

  return (
    <SafeAreaProvider>
      {/* Tum ekranlarin zemini koyu basliyor, saat/pil ikonlari beyaz */}
      <StatusBar style="light" />

      {oturum === null ? (
        <GirisEkrani onGiris={girisYapildi} />
      ) : ekran.ad === 'detay' ? (
        <DokumDetay
          dokum={ekran.dokum}
          rol={oturum.rol}
          sonDokumMu={sonDokum?.dokumId === ekran.dokum.dokumId}
          onGeri={listeye}
          onDuzenle={() => setEkran({ ad: 'duzenle', dokum: ekran.dokum })}
          onSilindi={listeye}
        />
      ) : ekran.ad === 'yeni' ? (
        <DokumFormu
          sonDokumZamani={sonDokum?.dokumZamani}
          onGeri={listeye}
          onKaydedildi={listeye}
        />
      ) : ekran.ad === 'duzenle' ? (
        <DokumFormu dokum={ekran.dokum} onGeri={listeye} onKaydedildi={listeye} />
      ) : (
        <DokumListesi
          oturum={oturum}
          onCikis={cikisYap}
          onDokumSec={(dokum) => setEkran({ ad: 'detay', dokum })}
          onYeniDokum={() => setEkran({ ad: 'yeni' })}
          onListeYuklendi={listeYuklendi}
        />
      )}
    </SafeAreaProvider>
  );
}
