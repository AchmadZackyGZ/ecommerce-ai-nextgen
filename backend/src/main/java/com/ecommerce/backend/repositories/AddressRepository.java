package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.Address;
import com.ecommerce.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    // 🔥 Wajib ditambah: Untuk mencari semua alamat milik seorang user
    List<Address> findByUser(User user); 
}