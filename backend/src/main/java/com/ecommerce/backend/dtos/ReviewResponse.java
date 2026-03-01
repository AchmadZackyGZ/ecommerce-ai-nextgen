package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String customerName; // Hanya kirimkan nama, JANGAN kirim email/password!
    private Integer rating;
    private String comment;
    private String imageUrl; // URL Cloudinary agar Frontend bisa langsung merender gambarnya
    private LocalDateTime createdAt;
}