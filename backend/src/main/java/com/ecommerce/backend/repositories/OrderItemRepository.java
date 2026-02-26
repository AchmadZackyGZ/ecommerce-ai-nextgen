package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // otomatis membuat CRUD untuk OrderItem, kita bisa tambahkan query khusus jika diperlukan
}