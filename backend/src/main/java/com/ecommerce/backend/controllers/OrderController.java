package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.OrderRequest;
import com.ecommerce.backend.dtos.OrderResponse;
import com.ecommerce.backend.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
// 🔥 GEMBOK SAKTI: Semua user yang teregistrasi boleh berbelanja!
@PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER')")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // API UTAMA: Eksekusi Checkout & Cetak Struk
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @RequestBody OrderRequest request,
            Principal principal // Mengambil email user yang sedang login
    ) {
        // Panggil otak kasir kita!
        OrderResponse orderResponse = orderService.checkout(request, principal.getName());

        ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("CHECKOUT BERHASIL! Pesanan Anda sedang diproses.")
                .data(orderResponse)
                .build();

        // Kita gunakan 201 CREATED karena kita mencetak "Struk/Order" baru di database
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}