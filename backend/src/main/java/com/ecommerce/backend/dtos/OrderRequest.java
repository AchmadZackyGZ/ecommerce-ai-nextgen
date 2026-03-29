package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class OrderRequest {
    private Long addressId;
    // Customer bisa masukin kode promo, bisa juga dikosongin (null)
    private String voucherCode; 

    // 🔥 TAMBAHAN BARU: Menangkap input form Checkout
    private String shippingMethod; // "reguler" / "kargo"
    private String paymentMethod; // "bank_transfer" / "cod"
    private String paymentBank; // "bca" / "mandiri" (bisa null jika cod)
    private String sellerNote; // Pesan dari pembeli
}