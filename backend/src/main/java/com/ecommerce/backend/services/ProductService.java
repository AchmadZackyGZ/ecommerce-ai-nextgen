package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    // membuat product baru (CREATE Product)
    public ProductResponse createProduct(ProductRequest request) {
        // Ubah DTO (Piring) menjadi Entity (Bahan Mentah)
        Product newProduct = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .build();

        // Simpan ke database
        Product savedProduct = productRepository.save(newProduct);

        // Kembalikan dalam bentuk Response (Piring Saji)
        return mapToResponse(savedProduct);
    }

    // mengambil semua product (READ Product)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        // mengubah list entity menjadi list response
        return products.stream()
                .map(this::mapToResponse) // Ubah setiap Product menjadi ProductResponse
                .collect(Collectors.toList());
    }

    // fungsi helper utk mengubah entity ke response
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
