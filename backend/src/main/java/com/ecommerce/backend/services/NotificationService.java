package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.NotificationResponse;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Notification;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.NotificationRepository;
import com.ecommerce.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.annotation.JsonAppend.Attr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        
        // mengamil seluruh notifikasi diurutkan dari yang paling baru
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notif -> NotificationResponse.builder()
                        .id(notif.getId())
                        .title(notif.getTitle())
                        .message(notif.getMessage())
                        .type(notif.getType())
                        .isRead(notif.isRead())
                        .createdAt(notif.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Fungsi untuk mengubah status notifikasi menjadi "Sudah Dibaca"
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
