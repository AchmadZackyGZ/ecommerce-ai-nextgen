package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private Integer totalPrice; // Total harga seluruh barang di keranjang
}