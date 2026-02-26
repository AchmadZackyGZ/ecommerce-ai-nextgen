package com.ecommerce.backend.models;

public enum OrderStatus {
    PENDING,    // Menunggu pembayaran
    PAID,       // Sudah dibayar, menunggu penjual mengirim
    SHIPPED,    // Dalam perjalanan
    COMPLETED,  // Selesai / Diterima pembeli
    CANCELLED   // Dibatalkan
}