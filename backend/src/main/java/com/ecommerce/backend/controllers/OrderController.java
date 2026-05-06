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
import java.util.List;

@RestController
@RequestMapping("/api/orders")
//   Semua user yang teregistrasi boleh berbelanja!
@PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER')")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // --- 1. API UTAMA: Eksekusi Checkout & Cetak Struk (EVOLUSI V1) ---
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @RequestBody OrderRequest request, //  Spring Boot otomatis menangkap addressId di sini!
            Principal principal 

    ) {
        // Panggil otak kasir kita!
        OrderResponse orderResponse = orderService.checkout(request, principal.getName());

        ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("CHECKOUT BERHASIL! Pesanan Anda sedang diproses dan akan dikirim ke alamat yang dipilih.")
                .data(orderResponse)
                .build();

        // Kita gunakan 201 CREATED karena kita mencetak "Struk/Order" baru di database
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- 2. API KEDUA: Melihat Riwayat Belanja User ---
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(Principal principal) {
        
        List<OrderResponse> orderHistory = orderService.getUserOrderHistory(principal.getName());

        ApiResponse<List<OrderResponse>> response = ApiResponse.<List<OrderResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat riwayat pesanan Anda.")
                .data(orderHistory)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 3. API KETIGA: Konfirmasi Pesanan Diterima (Menjadi COMPLETED) ---
    @PutMapping("/{orderId}/complete")
    public ResponseEntity<ApiResponse<OrderResponse>> completeOrder(
            @PathVariable Long orderId,
            Principal principal
    ) {
        OrderResponse completedOrder = orderService.completeOrder(orderId, principal.getName());

        ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Yey! Pesanan telah selesai dan diterima oleh Anda. Terima kasih telah berbelanja!")
                .data(completedOrder)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 4. API KEEMPAT: (KHUSUS SELLER) Melihat Pesanan Masuk ke Tokonya ---
    @GetMapping("/shop")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getShopOrders(Principal principal) {
        
        List<OrderResponse> shopOrders = orderService.getShopOrders(principal.getName());

        ApiResponse<List<OrderResponse>> response = ApiResponse.<List<OrderResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat daftar pesanan masuk ke toko Anda.")
                .data(shopOrders)
                .build();

        return ResponseEntity.ok(response);
    }

    // --- 5. API KELIMA: (KHUSUS SELLER) Memproses Pesanan & Kirim Barang ---
    @PutMapping("/{orderId}/ship")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @PathVariable Long orderId,
            Principal principal
    ) {
        OrderResponse shippedOrder = orderService.shipOrder(orderId, principal.getName());

        ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Pesanan berhasil di-update menjadi DIKIRIM!")
                .data(shippedOrder)
                .build();

        return ResponseEntity.ok(response);
    }
}