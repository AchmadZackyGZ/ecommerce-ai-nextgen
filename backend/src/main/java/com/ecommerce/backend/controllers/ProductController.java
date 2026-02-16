package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService; // Sekarang kita panggil service nya, bukan database nya atau models nya!

    // 1. Endpoint POST (Membuat produk baru)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Akan mengembalikan kode 201 Created
    public ProductResponse createProduct(@RequestBody ProductRequest productRequest) {
        return productService.createProduct(productRequest);
    }

    // 2. Endpoint GET (Mengambil semua produk)
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }
}