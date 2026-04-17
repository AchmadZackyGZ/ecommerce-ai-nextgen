package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.NotificationResponse;
import com.ecommerce.backend.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Principal principal) {
        return ResponseEntity.ok(ApiResponse.<List<NotificationResponse>>builder()
                .status(200)
                .message("Berhasil mengambil notifikasi")
                .data(notificationService.getUserNotifications(principal.getName()))
                .build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200)
                .message("Notifikasi dibaca")
                .data(null)
                .build());
    }
}