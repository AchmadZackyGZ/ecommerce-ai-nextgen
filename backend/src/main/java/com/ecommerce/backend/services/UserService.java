package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserRole;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service // Spring annotation to indicate that this class is a service component
public class UserService {
    
    @Autowired // Spring annotation to automatically inject the UserRepository dependency
    private UserRepository userRepository;

    // Method to create a new user based on the UserRequest DTO
   public UserResponse registerUser(UserRequest request) {
        // 1. Cek Email duplikat (Logic lama)
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email " + request.getEmail() + " sudah terdaftar!");
        }

        // 2. VALIDASI ROLE (LOGIC BARU ANDA) 🔥
        // Jika request role-nya kosong, otomatis jadi CUSTOMER
        // Jika user mencoba daftar jadi ADMIN, UBAH PAKSA jadi CUSTOMER (atau lempar error)
        UserRole roleToSave;
        try {
            roleToSave = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            // Jika user tidak isi role, atau isi ngawur, default ke CUSTOMER
            roleToSave = UserRole.CUSTOMER;
        }

        // PERATURAN KERAS: Dilarang daftar jadi ADMIN lewat API ini!
        if (roleToSave == UserRole.ADMIN) {
            throw new RuntimeException("Anda tidak boleh mendaftar sebagai Admin!");
        }

        // 3. Simpan User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(roleToSave) // Gunakan role yang sudah divalidasi
                .build();

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser); // Sesuaikan return mapping Anda
    }
}
