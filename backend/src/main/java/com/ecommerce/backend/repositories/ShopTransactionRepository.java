package com.ecommerce.backend.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ecommerce.backend.models.ShopTransaction;

public interface ShopTransactionRepository extends JpaRepository<ShopTransaction, Long> {
    // Biarkan kosong dulu, JpaRepository sudah punya fitur CRUD bawaan
}
