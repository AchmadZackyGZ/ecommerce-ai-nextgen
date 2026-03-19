package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.CartItemRequest;
import com.ecommerce.backend.dtos.CartResponse;
import com.ecommerce.backend.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
// 🔥 GEMBOK SAKTI: Customer dan Seller bebas berbelanja! Admin dilarang belanja.
@PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER')") 
public class CartController {

    @Autowired
    private CartService cartService;

    // --- 1. API untuk menambah barang ke keranjang (EVOLUSI V1) ---
    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestBody CartItemRequest request, // 🔥 Otomatis menangkap variantId dari Frontend React
            Principal principal 
    ) {
        String email = principal.getName();
        CartResponse cartResponse = cartService.addToCart(request, email);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Barang berhasil ditambahkan ke keranjang Anda.")
                .data(cartResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 2. API untuk melihat seluruh isi keranjang dan total harga ---
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Principal principal) {
        String email = principal.getName(); 
        CartResponse cartResponse = cartService.getCart(email);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat isi keranjang belanja.")
                .data(cartResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 3. API untuk mengubah jumlah barang (Update Quantity) ---
    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity, // 💡 Kita pakai Query Param agar simpel: ?quantity=5
            Principal principal 
    ) {
        String email = principal.getName();
        CartResponse cartResponse = cartService.updateCartItem(cartItemId, quantity, email);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Jumlah barang berhasil diperbarui.")
                .data(cartResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 4. API untuk menghapus barang dari keranjang (Delete Item) ---
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> deleteCartItem(
            @PathVariable Long cartItemId, 
            Principal principal 
    ) {
        String email = principal.getName();
        
        // Hapus barang dan TANGKAP nama barangnya dari Service (Sekarang nama Varian ikut terbawa!)
        String deletedName = cartService.deleteCartItem(cartItemId, email);

        // Ambil data keranjang terbaru (yang sudah kosong/berkurang itemnya)
        CartResponse lastCartResponse = cartService.getCart(email);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Barang '" + deletedName + "' berhasil dihapus dari keranjang.")
                .data(lastCartResponse)
                .build();

        return ResponseEntity.ok(response);
    }
}