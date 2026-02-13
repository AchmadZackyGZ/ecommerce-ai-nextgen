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
public class User {

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
    private String role; // Nanti isinya bisa "ADMIN" atau "CUSTOMER"

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}