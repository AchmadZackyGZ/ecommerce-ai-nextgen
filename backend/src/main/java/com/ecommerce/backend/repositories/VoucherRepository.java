package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    // Fitur Kasir: Mencari voucher berdasarkan kode yang diketik Customer
    Optional<Voucher> findByCode(String code);
    
    // Fitur Dashboard Seller: Mengambil semua voucher yang pernah dibuat oleh Toko ini
    List<Voucher> findByShop(Shop shop);
}