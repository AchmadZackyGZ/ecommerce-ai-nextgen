package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserRole;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service // Spring annotation to indicate that this class is a service component
public class UserService {
    
    @Autowired // Spring annotation to automatically inject the UserRepository dependency
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injecting the PasswordEncoder to hash passwords before saving to the database

    // Method to create a new user based on the UserRequest DTO
  public UserResponse registerUser(UserRequest request) {
        // 1. Cek Email duplikat
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email " + request.getEmail() + " sudah terdaftar!");
        }

        // 2. VALIDASI ROLE (Mencegah pendaftaran Admin) 🔥
        UserRole roleToSave;
        try {
            roleToSave = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            // Jika user tidak isi role, atau isinya ngawur (misal "HACKER"), paksa jadi CUSTOMER
            roleToSave = UserRole.CUSTOMER;
        }

        // PERATURAN KERAS: Dilarang daftar jadi ADMIN lewat API ini!
        if (roleToSave == UserRole.ADMIN) {
            throw new BadRequestException("Anda tidak boleh mendaftar sebagai Admin!");
        }

        // 3. Simpan User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Enkripsi password sebelum disimpan
                .role(roleToSave) 
                .build();

        User savedUser = userRepository.save(user);

        // 4. Kembalikan balasan yang rapi
        return mapToResponse(savedUser); 
    }

    // Fungsi bantuan (Helper) untuk mengubah Entity User menjadi DTO UserResponse
    // (PENTING: Kita tidak memasukkan password ke dalam response!)
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name()) // Mengubah Enum UserRole menjadi String
                .createdAt(user.getCreatedAt())
                .build();
    }
}
