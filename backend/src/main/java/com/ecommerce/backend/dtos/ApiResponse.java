package com.ecommerce.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int status;       // Untuk menampung angka 200, 201, 400, dll
    private String message;   // Untuk menampung pesan "Berhasil dibuat!", "Data tidak ditemukan", dll
    private T data;           // <T> artinya Tipe Dinamis. Bisa berisi ProductResponse, UserResponse, atau List
}