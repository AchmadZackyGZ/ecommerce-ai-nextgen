package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ShopProfileResponse;
import com.ecommerce.backend.dtos.ShopRequest;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.services.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController 
@RequestMapping("/api/shops")
public class ShopController {

    @Autowired
    private ShopService shopService;

    // 🔥 HANYA SELLER YANG BISA BUKA TOKO
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<ApiResponse<ShopResponse>> createShop(
            @ModelAttribute ShopRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image, // user tidak wajib menupload gambar saat buat toko
            Principal principal // 💡 INI FITUR SAKTI: Spring otomatis memberikan email user yang sedang login!
    ) {
        // Ambil email dari token JWT yang dikirim
        String email = principal.getName();     
        
        ShopResponse response = shopService.createShop(request, email, image);

        ApiResponse<ShopResponse> apiResponse = ApiResponse.<ShopResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Selamat! Toko berhasil didirikan.")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<ShopProfileResponse>> getShopProfile(@PathVariable Long id, Principal principal) {
        String currentUserEmail = principal.getName(); // Ambil email dari token JWT yang dikirim
        ShopProfileResponse profile = shopService.getShopProfile(id, currentUserEmail);
        
        ApiResponse<ShopProfileResponse> response = ApiResponse.<ShopProfileResponse>builder()
                .status(200)
                .message("Berhasil mengambil data profil toko")
                .data(profile)
                .build();
                
        return ResponseEntity.ok(response);
    }

    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/follow")
    public ResponseEntity<com.ecommerce.backend.dtos.ApiResponse<Boolean>> toggleFollow(
            @PathVariable Long id, 
            java.security.Principal principal
    ) {
        boolean isFollowing = shopService.toggleFollowShop(id, principal.getName());
        
        String message = isFollowing ? "Berhasil mengikuti toko!" : "Berhasil berhenti mengikuti toko.";
        
        return ResponseEntity.ok(com.ecommerce.backend.dtos.ApiResponse.<Boolean>builder()
                .status(200)
                .message(message)
                .data(isFollowing)
                .build());
    }
}