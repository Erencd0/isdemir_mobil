package com.isdemir.mobile.repository;

import com.isdemir.mobile.entity.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperatorRepository extends JpaRepository<Operator, Long> {

    /** Dokum ekranindaki operator combobox'i sadece calisanlari gostersin. */
    List<Operator> findByAkifPasifTrueOrderByOperatorAdiAsc();
}
