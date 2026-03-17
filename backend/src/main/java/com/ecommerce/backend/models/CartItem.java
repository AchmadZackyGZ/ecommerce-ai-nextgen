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

    // 🔥 RELASI 2: Barang (Varian) apa yang dibeli? (Evolusi V1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // 🔥 Berapa banyak barang yang dibeli?
    @Column(nullable = false)
    private Integer quantity;
}