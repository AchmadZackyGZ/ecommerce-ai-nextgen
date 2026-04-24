package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String category; // Fitur Kategori untuk memudahkan pencarian dan filter produk di frontend
    private String description;
    private BigDecimal price;
    private Integer stock;
    private List<String> imageUrls;

    // informasi tentang toko yang menjual produk ini!
    private Long shopId;
    private String shopName;

    // UNTUK FITUR CHAT GETSTREAM!
    private Long shopOwnerId;

    // informasi tambahan tentang toko untuk memperkaya tampilan di Frontend!
    private String shopAvatar;
    private Double shopRating;
    private Integer shopTotalProducts;
    private String shopJoinDate;
    private String shopResponseRate;
    private String shopLastActive;

    //  EVOLUSI V1: Tambahkan gerbong khusus untuk membawa data Varian ke Frontend!
    private java.util.List<ProductVariantResponse> variants;
    private LocalDateTime createdAt;
}
