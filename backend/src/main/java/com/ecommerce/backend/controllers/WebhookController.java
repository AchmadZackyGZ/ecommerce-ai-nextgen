package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.MidtransNotificationRequest;
import com.ecommerce.backend.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
// 🔥 TANPA GEMBOK @PreAuthorize! API ini harus bisa diakses Midtrans kita buat public
public class WebhookController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/midtrans")
    public ResponseEntity<String> handleMidtransNotification(@RequestBody MidtransNotificationRequest notification) {
        try {
            paymentService.processMidtransNotification(notification);
            // Harus membalas 200 OK agar Midtrans tahu pesannya sudah sampai
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}