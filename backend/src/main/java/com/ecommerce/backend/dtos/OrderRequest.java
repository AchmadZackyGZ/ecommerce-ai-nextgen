package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class OrderRequest {
    private Long addressId;
    // Customer bisa masukin kode promo, bisa juga dikosongin (null)
    private String voucherCode; 
}