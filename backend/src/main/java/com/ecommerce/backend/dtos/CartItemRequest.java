package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long variantId;
    private Integer quantity;
}