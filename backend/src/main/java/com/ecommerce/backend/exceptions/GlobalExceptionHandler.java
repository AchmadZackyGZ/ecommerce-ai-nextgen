package com.ecommerce.backend.exceptions;

import com.ecommerce.backend.dtos.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // Inilah anotasi ajaib yang menjadikannya "Global Handler"
public class GlobalExceptionHandler {

    // 1. Menangkap error jika Data Tidak Ditemukan (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage()) // Ambil pesan dari Service tadi
                .data(null)
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // 2. Menangkap semua error lain yang tidak terduga (500)
    // Misal: NullPointerException, Database Down, logic error, dll
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        ApiResponse<Object> response = ApiResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Terjadi kesalahan internal pada server: " + ex.getMessage())
                .data(null)
                .build();
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}