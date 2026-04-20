package com.ecommerce.backend.events;

import com.ecommerce.backend.models.Notification;
import com.ecommerce.backend.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    @Autowired
    private NotificationRepository notificationRepository;

    //  MESIN INI AKAN OTOMATIS MENYALA JIKA ADA EVENT STATUS PESANAN!
    @EventListener
    public void handleOrderStatusEvent(OrderStatusEvent event) {
        Notification notification = Notification.builder()
                .user(event.getUser())
                .title(event.getTitle())
                .message(event.getMessage())
                .type("STATUS_PESANAN")
                .isRead(false)
                .imageUrl(event.getImageUrl())
                .build();
        
        notificationRepository.save(notification);
        System.out.println("🔔 [BACKGROUND] Notifikasi berhasil disimpan untuk user: " + event.getUser().getEmail());
    }
}