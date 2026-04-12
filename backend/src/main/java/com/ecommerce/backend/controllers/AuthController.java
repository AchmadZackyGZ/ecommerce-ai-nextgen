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


@RestController 
@RequestMapping("/api/auth") 
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

   @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody AuthRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        // 1. Dapatkan IP Address (Cek proxy jika ada)
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        
        // 2. Dapatkan Info Browser & OS (User-Agent)
        String userAgent = httpRequest.getHeader("User-Agent");

        // 3. Lempar datanya ke AuthService
        AuthResponse authResponse = authService.login(request, ipAddress, userAgent);

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