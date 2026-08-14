package com.isdemir.mobile.security;

import com.isdemir.mobile.dto.HataCevap;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * Auth disindaki her istekte "Authorization: Bearer <accessToken>" arar.
 * Token gecerliyse icindeki bilgileri request'e koyar, controller'lar
 * @RequestAttribute ile okur. Gecersizse istek controller'a hic ulasmaz.
 *
 * Spring Security kullanmiyoruz, dogrulama burada bitiyor.
 */
@Component
@RequiredArgsConstructor
public class JwtFiltresi extends OncePerRequestFilter {

    /** Token istemeyen adresler - girmeden once token'in olmasi zaten imkansiz. */
    private static final Set<String> ACIK_YOLLAR = Set.of(
            "/api/auth/login",
            "/api/auth/refresh");

    public static final String KULLANICI_ID = "kullaniciId";
    public static final String KULLANICI_ADI = "kullaniciAdi";
    /** Oturumun rolu - "kv1 sadece kv1 dokumlerini gorur" gibi kisitlar bunu okur. */
    public static final String ROL = "rol";

    private static final String BEARER = "Bearer ";

    private final JwtYonetici jwtYonetici;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest istek) {
        return ACIK_YOLLAR.contains(istek.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest istek,
                                    HttpServletResponse cevap,
                                    FilterChain zincir) throws ServletException, IOException {

        String baslik = istek.getHeader(HttpHeaders.AUTHORIZATION);
        if (baslik == null || !baslik.startsWith(BEARER)) {
            hataYaz(cevap, "Authorization başlığı eksik");
            return;
        }

        Claims icerik;
        try {
            icerik = jwtYonetici.coz(baslik.substring(BEARER.length()));
        } catch (JwtException | IllegalArgumentException e) {
            // Suresi dolmus, imzasi tutmuyor ya da bozuk.
            hataYaz(cevap, "Access token geçersiz veya süresi dolmuş");
            return;
        }

        istek.setAttribute(KULLANICI_ID, icerik.get(KULLANICI_ID, Number.class).longValue());
        istek.setAttribute(KULLANICI_ADI, icerik.getSubject());
        istek.setAttribute(ROL, icerik.get(ROL, String.class));

        zincir.doFilter(istek, cevap);
    }

    /**
     * Filtre zincirinde oldugumuz icin GlobalHataYakalayici devreye girmiyor,
     * hata govdesini elle yaziyoruz. Format ayni kalsin diye HataCevap kullaniliyor.
     */
    private void hataYaz(HttpServletResponse cevap, String mesaj) throws IOException {
        cevap.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        cevap.setContentType(MediaType.APPLICATION_JSON_VALUE);
        cevap.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(cevap.getWriter(), new HataCevap("GECERSIZ_TOKEN", mesaj));
    }
}
