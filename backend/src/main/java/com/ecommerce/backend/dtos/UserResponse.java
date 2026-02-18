package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok annotation to generate getters, setters, and other utility methods
@Builder // Lombok annotation to implement the builder pattern for easier object creation
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    // Password TIDAK kita masukkan di sini!
    private LocalDateTime createdAt;
}
