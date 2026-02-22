package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
    // Fitur pencarian: Cari toko berdasarkan Pemiliknya (Seller)
    Optional<Shop> findByOwner(User owner);
    
    // Fitur pencarian: Cek apakah nama toko sudah dipakai orang lain
    boolean existsByName(String name);

    // untuk admin mencari toko yang masih pending
    List<Shop> findByStatus(ShopStatus status);
}