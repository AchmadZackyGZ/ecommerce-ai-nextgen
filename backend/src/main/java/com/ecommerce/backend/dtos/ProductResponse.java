package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    // 🔥 TAMBAHKAN INI UNTUK INFO TOKO
    private Long shopId;
    private String shopName;
    //  EVOLUSI V1: Tambahkan gerbong khusus untuk membawa data Varian ke Frontend!
    private java.util.List<ProductVariantResponse> variants;
    private LocalDateTime createdAt;
}
