package com.ecommerce.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.models.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Biarkan kosong dulu, JpaRepository sudah punya fitur CRUD bawaan
    
}
