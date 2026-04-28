package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class CheckoutRequest {
    private Long addressId;         // ID Alamat pengiriman yang dipilih
    private String shippingMethod;  // Cth: "Reguler", "Kargo"
    private String sellerNote;      // Catatan untuk penjual (Opsional)
    private Long voucherId;         // ID Voucher jika pakai (Opsional)
}
