package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.Review;
import com.ecommerce.backend.models.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Fitur untuk Frontend Next.js/Remix: Menampilkan daftar review di halaman detail produk
    List<Review> findByProduct(Product product);

    // Fitur untuk Backend AI Nexia: Mengambil semua review untuk produk tertentu agar AI bisa menganalisisnya
    List<Review> findByProductId(Long productId);

    // 🔥 FITUR BARU: Mengecek apakah user sudah pernah mereview produk ini (Anti-Spam)
    boolean existsByProductAndUser(Product product, User user);

    // 🔥 RADAR BARU: Cek apakah Produk ini sudah di-review di Pesanan (Order) yang ini?
    boolean existsByOrderAndProduct(Order order, Product product);

    // 🔥 MENGHITUNG RATA-RATA BINTANG SELURUH PRODUK DI SATU TOKO
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.shop.id = :shopId")
    Double getAverageRatingByShopId(@org.springframework.data.repository.query.Param("shopId") Long shopId);
}