package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price; // Harga saat dibeli
    private BigDecimal subTotal; // quantity * price
}