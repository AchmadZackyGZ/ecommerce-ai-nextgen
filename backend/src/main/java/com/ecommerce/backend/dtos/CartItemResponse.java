package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long id; // ID dari CartItem ini
    private Long productId;
    private String productName;
    private Integer price;
    private Integer quantity;
    private Integer subTotal; // Hasil kali price * quantity
}