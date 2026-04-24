package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private String productName;
    private List<String> imageUrls;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subTotal; // Hasil kali price * quantity
}