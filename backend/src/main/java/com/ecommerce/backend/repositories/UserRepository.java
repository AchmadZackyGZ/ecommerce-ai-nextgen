package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Keajaiban Spring Boot: Hanya dengan menulis nama method ini, 
    // Spring akan otomatis membuatkan query "SELECT * FROM users WHERE email = ?"
    Optional<User> findByEmail(String email); // Method untuk mencari user berdasarkan email
}
