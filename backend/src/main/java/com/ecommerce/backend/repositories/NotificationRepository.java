package com.ecommerce.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.models.Notification;


@Repository
public interface NotificationRepository extends  JpaRepository<Notification, Long>{
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
