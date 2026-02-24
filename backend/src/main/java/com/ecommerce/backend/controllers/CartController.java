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

    // 1. API untuk menambah barang ke keranjang
    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestBody CartItemRequest request,
            Principal principal // Mengambil email user yang sedang login
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

    // 2. API untuk melihat seluruh isi keranjang dan total harga
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Principal principal) {
        String email = principal.getName(); // Mengambil email user yang sedang login
        CartResponse cartResponse = cartService.getCart(email);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat isi keranjang belanja.")
                .data(cartResponse)
                .build();

        return ResponseEntity.ok(response);
    }
}