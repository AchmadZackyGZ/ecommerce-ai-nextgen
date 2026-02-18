package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> registerUser(@RequestBody UserRequest userRequest) {
        UserResponse newUser = userService.registerUser(userRequest);
        
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Registrasi berhasil! Selamat datang " + newUser.getName())
                .data(newUser)
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}