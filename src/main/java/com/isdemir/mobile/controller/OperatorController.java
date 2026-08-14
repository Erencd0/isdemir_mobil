package com.isdemir.mobile.controller;

import com.isdemir.mobile.dto.OperatorCevap;
import com.isdemir.mobile.repository.OperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dokum ekranindaki operator combobox'ini dolduran tek adres.
 * Pasif operatorler listede yok - eski dokumlerde gorunmeye devam ederler
 * ama yeni dokumde secilemezler.
 *
 * Arada servis yok: karar verilecek bir sey olmadigi icin repository'den
 * gelen liste dogrudan cevaba cevriliyor.
 */
@RestController
@RequestMapping("/api/operatorler")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorRepository operatorRepository;

    @GetMapping
    public List<OperatorCevap> listele() {
        return operatorRepository.findByAkifPasifTrueOrderByOperatorAdiAsc()
                .stream()
                .map(OperatorCevap::of)
                .toList();
    }
}
