package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;

import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    // Simpan URL dari Cloudinary (jika upload manual) ATAU URL Dicebear (jika generate random)
    private String avatarUrl;

    private String imageBannerUrl;

    private String videoBannerUrl;

    // table system pengikut (many-to-many)
    @ManyToMany
    @JoinTable(
        name = "shop_followers",
        joinColumns = @JoinColumn(name = "shop_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private java.util.Set<User> followers = new java.util.HashSet<>();

    @Builder.Default
    private Integer followerCount = 0;

    @Default
    private Integer responseRate = 100;

    // ENUM : Status Toko
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShopStatus status;

    // 🔥 RELASI 1: Satu Toko (Shop) dimiliki oleh Satu Penjual (User)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude // Untuk menghindari infinite loop saat toString() karena relasi dua arah
    @EqualsAndHashCode.Exclude // Untuk menghindari masalah saat membandingkan objek Shop karena relasi dua arah
    private User owner;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}