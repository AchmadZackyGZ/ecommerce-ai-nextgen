package com.ecommerce.backend.controllers;

import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // Menandakan ini adalah API
@RequestMapping("/api/products") // URL utama untuk controller ini
public class ProductController {

    // Memanggil jembatan repository kita
    @Autowired
    private ProductRepository productRepository;

    // Endpoint untuk mengambil SEMUA data produk
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll(); // Otomatis mengeksekusi "SELECT * FROM products"
    }
}