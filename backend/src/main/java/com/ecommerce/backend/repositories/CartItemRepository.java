package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Biarkan kosong dulu, JpaRepository sudah punya fitur CRUD bawaan
}