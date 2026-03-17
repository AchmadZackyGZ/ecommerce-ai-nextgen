package com.ecommerce.backend.config;

import com.ecommerce.backend.repositories.UserRepository;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Aktifkan anotasi @PreAuthorize di service untuk kontrol akses berbasis peran
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    // 🔥 TAMBAHKAN 3 BARIS INI UNTUK MEMANGGIL SATPAMNYA
    @Autowired
    @org.springframework.context.annotation.Lazy // Mencegah error "Circular Dependency"
    private JwtAuthenticationFilter jwtAuthFilter;

    // 1. Aturan Pintu Gerbang Utama
   @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Aktifkan CORS dengan konfigurasi default (bisa kita custom nanti)
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Biarkan preflight CORS lewat tanpa harus login
                .requestMatchers("/api/auth/**").permitAll() // Biarkan semua endpoint di AuthController bisa diakses tanpa login (untuk login & register)
                .requestMatchers("/api/webhooks/**").permitAll() // Biarkan Midtrans mengirim notifikasi tanpa harus login
                
                // 🔥 1. PERBAIKAN: HANYA GET yang public
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()    
                
                .anyRequest().authenticated()
            )
            // 🔥 2. PERBAIKAN: MATIKAN SESSION (WAJIB UNTUK JWT)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            // 🔥 3. PERBAIKAN: PASANG SATPAM JWT KITA DI DEPAN PINTU!
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean // Konfigurasi CORS untuk mengizinkan Frontend kita mengakses API
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Izinkan Frontend Anda
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        // Izinkan semua metode
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Izinkan semua header (termasuk Authorization)
        configuration.setAllowedHeaders(List.of("*"));
        // Wajib jika Anda nanti pakai Cookie/Session
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Buat sumber konfigurasi CORS
        // Terapkan aturan ini ke semua endpoint API
        source.registerCorsConfiguration("/**", configuration); 
        return source;
}

    // 2. Mesin Pencari User di Database
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan!"));
    }

    // 3. Mesin Pemeriksa Password (Mencocokkan input dengan hash BCrypt)
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        // authProvider.setUserDetailsService(userDetailsService()); // Sudah di-set di constructor, jadi ini opsional
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 4. Manajer Autentikasi (Yang akan kita panggil di AuthService nanti)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 5. Mesin Pengacak Password (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); 
    }
}