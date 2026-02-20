package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.AuthRequest;
import com.ecommerce.backend.dtos.AuthResponse;
import com.ecommerce.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // INI YANG DICARI OLEH SPRING BOOT!
@RequestMapping("/api/auth") // URL UTAMANYA
public class AuthController {

    @Autowired
    private AuthService authService;

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
}