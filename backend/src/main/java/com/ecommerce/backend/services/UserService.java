package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service // Spring annotation to indicate that this class is a service component
public class UserService {
    
    @Autowired // Spring annotation to automatically inject the UserRepository dependency
    private UserRepository userRepository;

    // Method to create a new user based on the UserRequest DTO
    public UserResponse registerUser(UserRequest request) {
        // cek apakah email sudah terdaftar
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            // Kita pakai RuntimeException dulu, nanti bisa ganti custom exception
            throw new RuntimeException("Email " + request.getEmail() + " sudah terdaftar");
        }

        // 2. Konversi DTO ke Entity
        // CATATAN: Di Sprint berikutnya (Security), kita akan mengenkripsi password ini!
        // Untuk sekarang, kita simpan apa adanya dulu (plain text) agar alurnya jalan.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // nanti di Sprint Security, ini akan dienkripsi
                .role(request.getRole() == null ? "Customer" : request.getRole()) // default role adalah "Customer"
                .build();
        
        // 3. Simpan ke database
        User savedUser = userRepository.save(user);

        // 4. Kembalikan dalam bentuk Response
        return UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }
}
