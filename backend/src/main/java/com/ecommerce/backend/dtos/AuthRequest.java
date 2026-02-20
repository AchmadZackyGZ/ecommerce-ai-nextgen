package com.ecommerce.backend.dtos;

import lombok.Data;

@Data // Lombok annotation to generate getters, setters, and other utility methods
public class AuthRequest {
    private String email;
    private String password;
}
