package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Struk milik siapa?
    @ManyToOne // Banyak order item bisa masuk ke satu order
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Barang (Varian) apa yang dibeli? (Evolusi V1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity;

    // 🔥 PENTING: Salinan harga barang pada detik checkout tersebut terjadi.
    @Column(nullable = false)
    private BigDecimal price;
}