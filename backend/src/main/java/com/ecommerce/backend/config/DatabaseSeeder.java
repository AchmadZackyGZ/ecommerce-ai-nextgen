package com.ecommerce.backend.config;

import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserRole;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injecting the PasswordEncoder to hash passwords before saving to the database

    @Override
    public void run(String... args) throws Exception {
        // Cek apakah Admin sudah ada? (Berdasarkan email)
        if (userRepository.findByEmail("admin@ecommerce.com").isEmpty()) {

            // Kalau belum ada, buat Admin baru sekarang!
            User admin = User.builder()
                    .name("Super_Admin")
                    .email("admin@ecommerce.com")
                    .password(passwordEncoder.encode("admin123")) // Enkripsi password default "admin123"
                    .role(UserRole.ADMIN) // Role sakti
                    .build();

            userRepository.save(admin);
            System.out.println("DATA SEEDER: Akun Admin berhasil dibuat!");
        } else {
            System.out.println("DATA SEEDER: Akun Admin sudah ada, skip.");
        }
    }
}