package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity // 🔥 GEMBOK SAKTI: Voucher hanya bisa dibuat oleh Seller, tidak bisa dibuat oleh Customer maupun Admin.
@Table(name = "vouchers") // Nama tabel di database
@Data // Untuk membuat getter, setter, toString, equals, hashCode otomatis
@NoArgsConstructor // Untuk membuat constructor tanpa argumen
@AllArgsConstructor // Untuk membuat constructor dengan semua argumen
@Builder // Untuk membuat builder pattern (opsional, tapi memudahkan saat membuat objek)
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Kode unik yang akan diketik oleh User (misal: ZACKYPROMO50)
    @Column(nullable = false, unique = true)
    private String code;

    // 🔥 PERUBAHAN 1: Berapa persen diskonnya? (Misal: 20 untuk 20%)
    @Column(nullable = false)
    private Integer discountPercentage;

    // 🔥 PERUBAHAN 2: Batas maksimal kerugian Seller (Misal: maksimal potong Rp 10.000)
    @Column(nullable = false)
    private BigDecimal maxDiscountAmount;

    // 🔥 Sisa kuota voucher (misal: 50x pakai)
    @Column(nullable = false)
    private Integer quota;

    // 🔥 Batas waktu kadaluarsa (misal: 7 hari dari sekarang)
    @Column(nullable = false)
    private LocalDateTime expiredAt;

    // 🔥 RELASI: Voucher ini milik Toko mana?
    // Agar Seller A tidak bisa menghapus voucher milik Seller B
    @ManyToOne
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;
}