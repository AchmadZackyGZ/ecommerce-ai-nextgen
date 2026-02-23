package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // membuat product baru (CREATE Product)
    public ProductResponse createProduct(ProductRequest request, String sellerEmail) {

        // cari data seller ke database
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!")); // ResourceNotFoundException

        // cari data toko ke database
        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko! Silakan buka toko terlebih dahulu."));

        // 3. ATURAN BISNIS: Cek apakah Toko sudah disetujui Admin
        if (shop.getStatus() != ShopStatus.APPROVED) {
            throw new BadRequestException("Akses Ditolak: Toko Anda masih berstatus " + shop.getStatus() + ". Tunggu persetujuan Admin untuk mulai berjualan.");
        }

        // 4. Bangun Produk dan TEMPELKAN ke Toko tersebut
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .shop(shop) // 🔥 INI KUNCI UTAMANYA! Produk resmi masuk ke Toko.
                .build();

        // Simpan ke database
        Product savedProduct = productRepository.save(product); 

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

    // mengambil product berdasarkan id
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));

        return mapToResponse(product);
    }

    // mengupdate product berdasarkan id
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));

        // Update field yang diubah
        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());
        existingProduct.setImageUrl(request.getImageUrl());

        // Simpan perubahan ke database
        Product updatedProduct = productRepository.save(existingProduct);

        return mapToResponse(updatedProduct);
    }

    // menghapus product berdasarkan id
    public void deleteProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));

        productRepository.delete(existingProduct);
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
