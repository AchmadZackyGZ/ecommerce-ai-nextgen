package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.PaymentRequest;
import com.ecommerce.backend.dtos.PaymentResponse;
import com.ecommerce.backend.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.backend.dtos.SnapResponse;

import java.security.Principal;

@RestController
@RequestMapping("/api/payments")
// 🔥 GEMBOK SAKTI: Semua user yang teregistrasi bisa membayar pesanannya sendiri
@PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER')")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // API UTAMA: Eksekusi Pembayaran (Simulasi Sinyal Midtrans)
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @RequestBody PaymentRequest request,
            Principal principal // Mengambil email user yang sedang login
    ) {
        // Panggil otak pembayaran kita!
        PaymentResponse paymentResponse = paymentService.processPayment(request, principal.getName());

        ApiResponse<PaymentResponse> response = ApiResponse.<PaymentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("PEMBAYARAN SUKSES! Kwitansi digital berhasil dicetak dan status pesanan menjadi PAID.")
                .data(paymentResponse)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // API BARU: Generate Snap Token
    @PostMapping("/snap-token/{orderId}")
    public ResponseEntity<ApiResponse<SnapResponse>> getSnapToken(
            @PathVariable Long orderId,
            Principal principal // Mengambil email user yang sedang login
    ) {
        SnapResponse snapResponse = paymentService.createSnapToken(orderId, principal.getName());

        ApiResponse<SnapResponse> response = ApiResponse.<SnapResponse>builder()
                .status(HttpStatus.OK.value()) // repsonse status OK atau 200 karena ini hanya generate token, belum benar-benar melakukan pembayaran
                .message("Berhasil mendapatkan Snap Token dari Midtrans!")
                .data(snapResponse)
                .build();

        return ResponseEntity.ok(response);
    }
}