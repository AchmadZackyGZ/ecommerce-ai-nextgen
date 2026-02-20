package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data // Otomatis membuatkan Getter, Setter, toString dari Lombok
@NoArgsConstructor // Membuat constructor kosong (syarat wajib JPA)
@AllArgsConstructor // Membuat constructor dengan semua parameter
@Builder // Memudahkan kita membuat object User nanti
@Entity // Menandakan bahwa class ini adalah tabel Database
@Table(name = "users") // PENTING: Kita pakai "users", bukan "user", karena "user" adalah kata terlarang (reserved keyword) di PostgreSQL!
public class User implements org.springframework.security.core.userdetails.UserDetails { // Implementasi UserDetails untuk integrasi dengan Spring Security

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Menyimpan enum sebagai String di database
    private UserRole role; // Ganti dari String ke UserRole (enum) that create UserRole.java

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- METHOD WAJIB DARI USERDETAILS SPRING SECURITY ---

    // Mengubah Role kita menjadi format yang dipahami Spring Security (misal: "ROLE_ADMIN")
    @Override
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // Kita menggunakan Email sebagai Username untuk Login
    @Override
    public String getUsername() {
        return email; 
    }

    // Sisanya kita set "true" semua yang menandakan akun ini aktif dan tidak diblokir
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}