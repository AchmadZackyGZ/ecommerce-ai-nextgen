package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String imageUrl;
    private boolean isRead;
    private LocalDateTime createdAt;
}