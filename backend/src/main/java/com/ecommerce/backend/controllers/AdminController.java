package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.services.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // 🔥 GEMBOK SAKTI: HANYA ADMIN YANG BISA MASUK KESINI
public class AdminController {

    @Autowired
    private ShopService shopService;

    // 1. Ambil daftar toko yang PENDING
    @GetMapping("/shops/pending")
    public ResponseEntity<ApiResponse<List<ShopResponse>>> getPendingShops() {
        List<ShopResponse> pendingShops = shopService.getPendingShops();
        
        ApiResponse<List<ShopResponse>> response = ApiResponse.<List<ShopResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil mengambil data toko yang menunggu persetujuan")
                .data(pendingShops)
                .build();
                
        return ResponseEntity.ok(response);
    }

    // 2. Approve Toko
    @PutMapping("/shops/{shopId}/approve")
    public ResponseEntity<ApiResponse<ShopResponse>> approveShop(@PathVariable Long shopId) {
        ShopResponse approvedShop = shopService.updateShopStatus(shopId, ShopStatus.APPROVED);
        
        ApiResponse<ShopResponse> response = ApiResponse.<ShopResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Toko berhasil di-Approve dan siap beroperasi!")
                .data(approvedShop)
                .build();
                
        return ResponseEntity.ok(response);
    }
    
    // 3. Reject Toko
    @PutMapping("/shops/{shopId}/reject")
    public ResponseEntity<ApiResponse<ShopResponse>> rejectShop(@PathVariable Long shopId) {
        ShopResponse rejectedShop = shopService.updateShopStatus(shopId, ShopStatus.REJECTED);
        
        ApiResponse<ShopResponse> response = ApiResponse.<ShopResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Toko telah ditolak.")
                .data(rejectedShop)
                .build();
                
        return ResponseEntity.ok(response);
    }
}