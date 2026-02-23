package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Cart;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // Fitur sakti: Cari keranjang berdasarkan pemiliknya (User yang sedang login)
    Optional<Cart> findByUser(User user);
}