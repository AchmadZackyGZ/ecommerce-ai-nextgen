package com.ecommerce.backend.config;

import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserRole;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Cek apakah Admin sudah ada? (Berdasarkan email)
        if (userRepository.findByEmail("admin@ecommerce.com").isEmpty()) {
            
            // Kalau belum ada, buat Admin baru sekarang!
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@ecommerce.com")
                    .password("admin123") // Nanti di Sprint 7 kita enkripsi ini!
                    .role(UserRole.ADMIN) // Role sakti
                    .build();

            userRepository.save(admin);
            System.out.println("DATA SEEDER: Akun Admin berhasil dibuat!");
        } else {
            System.out.println("DATA SEEDER: Akun Admin sudah ada, skip.");
        }
    }
}