package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Fitur: Menampilkan riwayat pesanan milik user tertentu
    List<Order> findByUser(User user);

    // 🔥 FITUR SELLER BARU: Mencari semua pesanan yang mengandung produk dari toko ini
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.variant.product.shop = :shop")
    List<Order> findOrdersByShop(@Param("shop") Shop shop);

    Optional<Order> findByInvoiceId(String invoiceId);
}