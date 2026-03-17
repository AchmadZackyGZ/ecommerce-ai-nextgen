package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor 
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String variantName; // cth: "Hitam, +Hardcase"

    @Column(nullable = false)
    private BigDecimal priceModifier; // Harga tambahan varian ini (Bisa 0)

    @Column(nullable = false)
    private Integer stock;
}