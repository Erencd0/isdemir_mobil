package com.isdemir.mobile.security;

import com.isdemir.mobile.entity.Kullanici;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Access token uretir ve dogrular.
 * Refresh token JWT degil, DB'de duran rastgele bir UUID - onun dogrulamasi AuthService'te.
 */
@Component
public class JwtYonetici {

    private final SecretKey anahtar;

    /** Access token kac saniye gecerli. Cevaptaki gecerlilikSn de buradan gelir. */
    @Getter
    private final long gecerlilikSn;

    public JwtYonetici(@Value("${jwt.secret}") String secret,
                       @Value("${jwt.access-gecerlilik-sn}") long gecerlilikSn) {
        this.anahtar = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.gecerlilikSn = gecerlilikSn;
    }

    /**
     * Token kullaniciyi temsil eder, rolu degil - icinde rol claim'i YOKTUR.
     * Rol secimi ekran tercihidir; token ile arasinda bag kurmuyoruz, bu sayede
     * refresh sirasinda "bu oturum hangi roldeydi" sorusu hic dogmuyor.
     */
    public String uret(Kullanici kullanici) {
        Instant simdi = Instant.now();
        return Jwts.builder()
                .subject(kullanici.getKullaniciAdi())
                .claim("kullaniciId", kullanici.getId())
                .issuedAt(Date.from(simdi))
                .expiration(Date.from(simdi.plusSeconds(gecerlilikSn)))
                .signWith(anahtar)
                .compact();
    }

    /**
     * Imzayi ve son kullanma tarihini kontrol eder, token'in icindekileri doner.
     * Token bozuk, imzasi tutmuyor ya da suresi dolmussa JwtException firlatir.
     */
    public Claims coz(String token) {
        return Jwts.parser()
                .verifyWith(anahtar)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
