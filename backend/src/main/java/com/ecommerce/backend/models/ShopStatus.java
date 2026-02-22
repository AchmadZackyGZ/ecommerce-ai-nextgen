package com.ecommerce.backend.models;

public enum ShopStatus {
    PENDING,   // Menunggu persetujuan Admin
    APPROVED,  // Disetujui, boleh jualan
    REJECTED   // Ditolak
}
