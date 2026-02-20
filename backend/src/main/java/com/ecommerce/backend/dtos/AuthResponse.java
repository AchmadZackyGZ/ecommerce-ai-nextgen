package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data  //Lombok annotation to generate getters, setters, and other utility methods
@Builder // Lombok annotation to generate a builder pattern for this class
public class AuthResponse {
    private String token; // Tiket sakti JWT-nya
    private String name; // private String email 
    private String email; // Nama user untuk ditampilkan di Frontend nanti
    private String role;  // Role user (ADMIN/CUSTOMER/SELLER)
}
