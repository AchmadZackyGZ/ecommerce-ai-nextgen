package com.ecommerce.backend.repositories;

import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    // Fungsi untuk mencari semua perangkat yang masih aktif milik seorang user
    List<UserDevice> findByUserAndIsActiveTrueOrderByLastLoginDesc(User user);
}