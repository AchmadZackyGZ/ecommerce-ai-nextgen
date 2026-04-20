package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // Contoh: "STATUS_PESANAN" atau "PROMO"

    private String imageUrl; // Opsional, untuk ikon atau gambar terkait notifikasi

    @Builder.Default
    private boolean isRead = false; // 🔥 Kunci untuk Titik Merah (Unread Badge)

    @CreationTimestamp
    private LocalDateTime createdAt;
}