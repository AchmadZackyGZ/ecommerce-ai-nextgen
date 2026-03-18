package com.ecommerce.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.models.Address;

@Repository // Spring annotation to indicate that this interface is a repository component
public interface AddressRepository extends JpaRepository<Address, Long> {
    // Biarkan kosong dulu, JpaRepository sudah punya fitur CRUD bawaan
    
}
