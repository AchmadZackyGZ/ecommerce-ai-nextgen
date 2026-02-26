package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Fitur: Menampilkan riwayat pesanan milik user tertentu
    List<Order> findByUser(User user);
}