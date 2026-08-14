package com.isdemir.mobile.repository;

import com.isdemir.mobile.entity.MalzemeTanim;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MalzemeTanimRepository extends JpaRepository<MalzemeTanim, Long> {

    /** Belirli turdeki (KONVKATKI / POTAKATKI / HURDAKATKI) malzemeler, ada gore sirali. */
    List<MalzemeTanim> findByMalzemeTuruOrderByMalzemeAdiAsc(String malzemeTuru);
}
