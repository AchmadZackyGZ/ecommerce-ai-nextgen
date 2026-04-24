package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 RELASI 2: Banyak Produk (Product) dimiliki oleh Satu Toko (Shop)
    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price; // Menggunakan BigDecimal untuk nominal uang agar lebih akurat dari Double

    @Column(nullable = false)
    private Integer stock;

    // 🔥 EVOLUSI V2: Multi-Image Support! (Hibernate akan otomatis buat tabel product_images)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private java.util.List<String> imageUrls = new java.util.ArrayList<>();

    @Column(nullable = false)
    private String category; //  Fitur Kategori untuk memudahkan pencarian dan filter produk di frontend

    // penghitung jumlah produk yang sudah terjual, bisa diupdate setiap kali ada transaksi berhasil
    @Builder.Default
    @Column(nullable = false)
    private Integer soldCount = 0;

    // 🔥 RELASI EVOLUSI V1: Satu Produk punya banyak Varian (Warna/Ukuran)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private java.util.List<ProductVariant> variants;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}