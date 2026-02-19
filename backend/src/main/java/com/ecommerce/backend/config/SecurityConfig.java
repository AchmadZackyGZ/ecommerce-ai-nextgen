package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Aturan Pintu Gerbang Utama
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Matikan CSRF karena kita pakai API / JWT (Bukan Form HTML kuno)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/register").permitAll() // Bebas akses untuk daftar
                .requestMatchers("/api/products/**").permitAll()    // Bebas akses untuk lihat produk
                .anyRequest().authenticated()                       // Sisanya WAJIB punya tiket JWT!
            );
            
        return http.build();
    }

    // 2. Mesin Pengacak Password (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); 
    }
}