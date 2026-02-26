package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class OrderRequest {
    private String shippingAddress;
    // Customer bisa masukin kode promo, bisa juga dikosongin (null)
    private String voucherCode; 
}