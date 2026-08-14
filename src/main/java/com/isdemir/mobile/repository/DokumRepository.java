package com.isdemir.mobile.repository;

import com.isdemir.mobile.entity.Dokum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DokumRepository extends JpaRepository<Dokum, Long> {

    /** kv rolleri sadece kendi konverterini gorur. */
    List<Dokum> findByKonverterNoOrderByDokumZamaniDesc(Long konverterNo);

    /** Genel_kullanici hepsini gorur. */
    List<Dokum> findAllByOrderByDokumZamaniDesc();

    /** O konverterde su ana kadar verilmis en buyuk numara; ilk dokumde null doner. */
    @Query("select max(d.dokumNo) from Dokum d where d.konverterNo = :konverterNo")
    Long enBuyukDokumNo(@Param("konverterNo") Long konverterNo);

    /**
     * Ayni konverterde, verilen zaman araligiyla kesisen bir dokum var mi?
     * Bir konverterde ayni anda iki dokum olamaz: yeni dokum, oncekinin
     * dokum zamani gecmeden baslayamaz. Gecmise kayit girilirse de
     * araya sikistirilmis dokumu bu kontrol yakalar.
     */
    @Query("""
            select count(d) > 0 from Dokum d
            where d.konverterNo = :konverterNo
              and d.hurdaSarjBaslama <= :bitis
              and d.dokumZamani >= :baslangic
            """)
    boolean cakisanDokumVarMi(@Param("konverterNo") Long konverterNo,
                              @Param("baslangic") LocalDateTime baslangic,
                              @Param("bitis") LocalDateTime bitis);
}
