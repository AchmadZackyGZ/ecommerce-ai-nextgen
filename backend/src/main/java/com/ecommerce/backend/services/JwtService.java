package com.ecommerce.backend.services;

import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Mengambil stempel rahasia dari application.yml
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    // Mengambil waktu kadaluarsa dari application.yml
    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .claims(new HashMap<>())
                .subject(userDetails.getUsername()) 
                .issuedAt(new Date(System.currentTimeMillis())) 
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration)) 
                .signWith(getSignInKey(), Jwts.SIG.HS256)  
                .compact();
    }

    //  Extract Username dari Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // MESIN PENGECEK KEASLIAN (Validasi Token)
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Tiket valid jika emailnya cocok dan belum kadaluarsa
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // -- Fungsi Bantuan Internal Pabrik --

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) 
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Mengubah String Base64 menjadi Kunci Rahasia asli
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}