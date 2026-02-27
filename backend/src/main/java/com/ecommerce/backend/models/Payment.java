package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 RELASI: 1 Kwitansi ini untuk bayar Struk/Order yang mana?
    // Kita pakai @OneToOne karena 1 Order yang sukses pasti punya 1 Kwitansi
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 🔥 Nomor Resi/Transaksi dari Midtrans (Nanti kita generate acak untuk simulasi)
    @Column(nullable = false, unique = true)
    private String transactionId;

    // 🔥 Bayar pakai apa? (Misal: BCA_VA, GOPAY, Q-RIS)s
    @Column(nullable = false)
    private String paymentMethod;

    // 🔥 Total yang dibayarkan (Harus sama persis dengan grandTotal di Order)
    @Column(nullable = false)
    private BigDecimal amount;

    // 🔥 Kapan tepatnya uang itu masuk?
    @Column(nullable = false)
    private LocalDateTime paymentDate;

    // 🔥 Status kwitansi (SUCCESS / FAILED)
    @Column(nullable = false)
    private String paymentStatus;
}