package com.isdemir.mobile.repository;

import com.isdemir.mobile.dto.MalzemeKullanimCevap;
import com.isdemir.mobile.entity.MalzemeKullanim;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MalzemeKullanimRepository extends JpaRepository<MalzemeKullanim, Long> {

    /**
     * Bir dokumun malzeme kullanimlarini, malzeme adiyla birlikte doner.
     *
     * left join kullaniliyor: malzeme_id bos olan (ya da tanimi silinmis) bir
     * satir varsa kayit yine listede gorunsun, adi bos gelsin - sessizce
     * kaybolmasindan iyidir.
     */
    @Query("""
            select new com.isdemir.mobile.dto.MalzemeKullanimCevap(
                k.malzemeKullanimId, k.dokumId, k.malzemeId,
                t.malzemeAdi, t.malzemeTuru, k.miktar, k.malzemeVerilisTarihi)
            from MalzemeKullanim k
            left join MalzemeTanim t on t.malzemeId = k.malzemeId
            where k.dokumId = :dokumId
            order by k.malzemeKullanimId asc
            """)
    List<MalzemeKullanimCevap> dokumKullanimlari(@Param("dokumId") Long dokumId);
}
