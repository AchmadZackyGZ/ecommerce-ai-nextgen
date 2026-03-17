package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.AuthRequest;
import com.ecommerce.backend.dtos.AuthResponse;
import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.services.AuthService;
import com.ecommerce.backend.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}