package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 RELASI 1: Barang ini ada di dalam Keranjang siapa?
    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // 🔥 RELASI 2: Barang apa yang dibeli? (Nunjuk ke tabel Product)
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 🔥 Berapa banyak barang yang dibeli?
    @Column(nullable = false)
    private Integer quantity;
}