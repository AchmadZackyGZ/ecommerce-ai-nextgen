package com.ecommerce.backend.events;

import com.ecommerce.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderStatusEvent {
    private User user;
    private String title;
    private String message;
}