package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ecommerce.backend.models.Shop;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    //  MENGHITUNG TOTAL PRODUK YANG DIMILIKI SEBUAH TOKO
    int countByShop(Shop shop);

    List<Product> findByShop(Shop shop);

    // Ambil produk dari Toko X, urutkan berdasarkan soldCount tertinggi (Terlaris)
    List<Product> findTop5ByShopOrderBySoldCountDesc(Shop shop);            
}