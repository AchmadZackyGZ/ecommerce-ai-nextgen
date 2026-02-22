package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ShopRequest;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.services.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody ShopRequest request,
            Principal principal // 💡 INI FITUR SAKTI: Spring otomatis memberikan email user yang sedang login!
    ) {
        // Ambil email dari token JWT yang dikirim
        String email = principal.getName(); 
        
        ShopResponse response = shopService.createShop(request, email);

        ApiResponse<ShopResponse> apiResponse = ApiResponse.<ShopResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Selamat! Toko berhasil didirikan.")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
}