package com.ecommerce.backend.repositories;

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

    // 🔥 FITUR BARU: Mengecek apakah user sudah pernah mereview produk ini (Anti-Spam)
    boolean existsByProductAndUser(Product product, User user);
}