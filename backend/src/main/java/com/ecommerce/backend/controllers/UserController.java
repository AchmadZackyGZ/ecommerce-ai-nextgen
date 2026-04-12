package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.dtos.ChangePasswordRequest;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Principal principal) {
        User user = userService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Data profil berhasil diambil")
                .data(mapToResponse(user)) // 🔥 TRANSLATE DULU SEBELUM DIKIRIM!
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) MultipartFile avatar,
            Principal principal) {
        
        User updatedUser = userService.updateProfile(principal.getName(), name, phone, avatar);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Profil berhasil diperbarui!")
                .data(mapToResponse(updatedUser)) // 🔥 TRANSLATE DULU SEBELUM DIKIRIM!
                .build());
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal principal) {
        
        userService.changePassword(principal.getName(), request.getOldPassword(), request.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200)
                .message("Keamanan akun diperbarui! Password berhasil diubah.")
                .data(null)
                .build());
    }


    // 🔥 HELPER SAKTI: Mengubah Entity User menjadi DTO yang aman dari Infinite Loop
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}