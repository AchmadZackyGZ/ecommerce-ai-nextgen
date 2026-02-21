package com.ecommerce.backend.config;

import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Aktifkan anotasi @PreAuthorize di service untuk kontrol akses berbasis peran
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    // 1. Aturan Pintu Gerbang Utama
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/register").permitAll() 
                .requestMatchers("/api/auth/login").permitAll()  // 🔥 BUKA PINTU UNTUK LOGIN!
                .requestMatchers("/api/products/**").permitAll()    
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider()); // Daftarkan mesin pemeriksa password
            
        return http.build();
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

// NOTE: File ini sudah dihapus karena kita pakai JWT untuk otentikasi, jadi aturan keamanan kita atur langsung di controller dan service, bukan di sini lagi. Tapi aku simpan dulu sebagai referensi kalau kamu mau lihat gimana aturan keamanan dasar di Spring Security itu dibuat. Kalau nanti mau pakai JWT, kita akan buat filter khusus untuk memeriksa token JWT di setiap request, bukan pakai konfigurasi ini lagi.
// package com.ecommerce.backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     // 1. Aturan Pintu Gerbang Utama
//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             .csrf(AbstractHttpConfigurer::disable) // Matikan CSRF karena kita pakai API / JWT (Bukan Form HTML kuno)
//             .authorizeHttpRequests(auth -> auth
//                 .requestMatchers("/api/users/register").permitAll() // Bebas akses untuk daftar
//                 .requestMatchers("/api/products/**").permitAll()    // Bebas akses untuk lihat produk
//                 .anyRequest().authenticated()                       // Sisanya WAJIB punya tiket JWT!
//             );
            
//         return http.build();
//     }

//     // 2. Mesin Pengacak Password (BCrypt)
//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder(); 
//     }
// }