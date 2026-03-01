package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Relasi ke Barang yang di-review
    @ManyToOne // Banyak review bisa untuk satu produk
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 🔥 Relasi ke Customer yang memberikan review
    @ManyToOne // Banyak review bisa dari satu user
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // Nilai Bintang 1 - 5

    @Column(length = 1000)
    private String comment; // Komentar teks (maksimal 1000 karakter)

    // 🔥 Di sinilah URL Cloudinary akan disimpan! (Bisa kosong jika user tidak upload foto)
    private String imageUrl;

    private LocalDateTime createdAt;
}