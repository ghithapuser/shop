package com.shop.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET_STRING = "dayLaMotChuoiBimatRatDaiVaAnToanChoJwtSpringSecurity12345";
    private static final SecretKey key =
            Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    // tạo token
    public static String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    // lấy username
    public static String extractUsername(String token) {
        Jws<Claims> jwt = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

        return jwt.getPayload().getSubject();
    }

    // lấy role
    public static String extractRole(String token) {
        Jws<Claims> jwt = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

        return jwt.getPayload().get("role", String.class);
    }
}