package com.ecommerce.backend.dtos;

import lombok.Data;

@Data // Lombok annotation to generate getters, setters, and other utility methods
public class UserRequest {
    private String name;
    private String email;
    private String password;
    private String role; // Biarkan String di DTO agar User mengetik teks, nanti kita konversi di Service
}
