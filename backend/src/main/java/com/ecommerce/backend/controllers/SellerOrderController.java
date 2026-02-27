package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
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
@RequestMapping("/api/seller/orders")
// 🔥 GEMBOK SAKTI: HANYA SELLER YANG BISA MASUK KESINI
@PreAuthorize("hasRole('SELLER')")
public class SellerOrderController {

    @Autowired
    private OrderService orderService;

    // 1. API: Melihat Daftar Pesanan Masuk
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getIncomingOrders(Principal principal) {
        List<OrderResponse> orders = orderService.getShopOrders(principal.getName());

        ApiResponse<List<OrderResponse>> response = ApiResponse.<List<OrderResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat daftar pesanan toko Anda.")
                .data(orders)
                .build();

        return ResponseEntity.ok(response);
    }

    // 2. API: Mengubah Status Pesanan Menjadi SHIPPED
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @PathVariable Long orderId,
            Principal principal
    ) {
        OrderResponse updatedOrder = orderService.shipOrder(orderId, principal.getName());

        ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Mantap! Pesanan berhasil diproses dan status berubah menjadi SHIPPED 🚚💨")
                .data(updatedOrder)
                .build();

        return ResponseEntity.ok(response);
    }
}