package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.CreditCard;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    List<CreditCard> findByUser(User user);
    
    // 🔥 Alat penghitung untuk membatasi maksimal 3 kartu
    long countByUser(User user); 
    
    // Mencegah duplikasi kartu yang sama
    boolean existsBySavedTokenId(String savedTokenId);
}