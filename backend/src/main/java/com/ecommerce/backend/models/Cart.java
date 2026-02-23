package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 RELASI 1: Satu Keranjang HANYA milik Satu User (Customer/Seller)
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔥 RELASI 2: Satu Keranjang bisa berisi BANYAK Barang (CartItem)
    // CascadeType.ALL & orphanRemoval = true artinya: Jika keranjang dihapus, isinya ikut terhapus otomatis!
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();
}