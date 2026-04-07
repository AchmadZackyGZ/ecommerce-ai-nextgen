package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.AuthRequest;
import com.ecommerce.backend.dtos.AuthResponse;
import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.services.AuthService;
import com.ecommerce.backend.services.UserService;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController // INI YANG DICARI OLEH SPRING BOOT!
@RequestMapping("/api/auth") // URL UTAMANYA
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login") // INI RUANGANNYA!
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request);

        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Login berhasil!")
                .data(authResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register") // Pindah ke sini
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody UserRequest request) {
        // Tetap memanggil fungsi hebat yang ada di UserService Anda
        UserResponse newUser = userService.registerUser(request); 
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Registrasi berhasil!")
                .data(newUser)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.<User>builder().status(200).message("Data profil berhasil diambil").data(user).build());
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) MultipartFile avatar,
            Principal principal) {
        
        User updatedUser = userService.updateProfile(principal.getName(), name, phone, avatar);
        return ResponseEntity.ok(ApiResponse.<User>builder().status(200).message("Profil berhasil diperbarui!").data(updatedUser).build());
    }
}