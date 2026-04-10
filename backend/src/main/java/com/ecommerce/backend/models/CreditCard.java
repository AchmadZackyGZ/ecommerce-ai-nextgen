package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "credit_cards")
@Data
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Relasi ke Pemilik Kartu (Dilindungi dari StackOverflow)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude 
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false)
    private String maskedNumber; // Cth: "4242-1111"

    @Column(nullable = false)
    private String bankName; // Cth: "BCA", "Mandiri"

    @Column(nullable = false)
    private String cardType; // Cth: "VISA", "MASTERCARD"

    @Column(nullable = false, unique = true)
    private String savedTokenId; // 🔥 NYAWA UTAMA: Token rahasia dari Midtrans!
}