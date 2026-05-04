package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shop_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Uang ini masuk/keluar dari toko mana?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Shop shop;

    // Transaksi ini berasal dari order mana? (Bisa null jika ini adalah penarikan dana/withdrawal)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    // Jumlah uang bersih yang masuk ke toko
    @Column(nullable = false)
    private BigDecimal amount;

    // Potongan 1% untuk Admin Nexia
    @Column(nullable = false)
    private BigDecimal platformFee;

    // Jenis Transaksi: "EARNING" (Pendapatan) atau "WITHDRAWAL" (Penarikan)
    @Column(nullable = false)
    private String type; 

    // Deskripsi: Cth "Pendapatan dari Pesanan INV-2026..."
    @Column(nullable = false)
    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}