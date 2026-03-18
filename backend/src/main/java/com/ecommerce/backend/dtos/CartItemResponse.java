package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subTotal; // Hasil kali price * quantity
}