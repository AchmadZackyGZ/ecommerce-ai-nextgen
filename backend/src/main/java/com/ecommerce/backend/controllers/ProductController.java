package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 1. Endpoint POST (Membuat produk baru)
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody ProductRequest productRequest) {
        // Proses datanya di Service
        ProductResponse savedData = productService.createProduct(productRequest);
        
        // Bungkus dengan ApiResponse
        ApiResponse<ProductResponse> response = ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.CREATED.value()) // Angka 201
                .message("Berhasil menambahkan data produk baru")
                .data(savedData)
                .build();

        // Kirim menggunakan Kurir (ResponseEntity)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Endpoint GET (Mengambil semua produk)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> allData = productService.getAllProducts();
        
        ApiResponse<List<ProductResponse>> response = ApiResponse.<List<ProductResponse>>builder()
                .status(HttpStatus.OK.value()) // Angka 200
                .message("Berhasil mengambil semua data produk")
                .data(allData)
                .build();

        return ResponseEntity.ok(response);
    }
}