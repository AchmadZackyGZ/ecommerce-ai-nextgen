package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice; // Total harga seluruh barang di keranjang
}