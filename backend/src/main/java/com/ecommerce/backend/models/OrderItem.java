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

    // Barang apa yang dibeli?
    @ManyToOne // Banyak order item bisa merujuk ke satu produk yang sama
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    // 🔥 PENTING: Salinan harga barang pada detik checkout tersebut terjadi.
    @Column(nullable = false)
    private BigDecimal price;
}