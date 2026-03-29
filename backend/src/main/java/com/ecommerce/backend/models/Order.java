package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // 🔥 WAJIB "orders" BUKAN "order"
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Siapa yang belanja?
    // 🔥 PENTING: Relasi ke User, bukan hanya menyimpan userId. Kita butuh akses ke data user untuk berbagai keperluan (misal: nama pembeli di struk, email untuk notifikasi, dll).
    @ManyToOne // Banyak order bisa dibuat oleh satu user
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Alamat tujuan pengiriman (Evolusi V1: Relasi ke tabel Address)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address shippingAddress;

    // Total harga barang (sebelum diskon)
    @Column(nullable = false)
    private BigDecimal subTotal;

    // Potongan harga dari Voucher
    @Column(nullable = false)
    private BigDecimal discount;

    // Total yang WAJIB DIBAYAR (subTotal - discount)
    @Column(nullable = false)
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    private String shippingMethod; // Cth: "reguler", "kargo"
    
    private String paymentMethod; // Cth: "bank_transfer", "cod"
    
    private String paymentBank; // Cth: "bca", "mandiri" (Bisa null jika COD)
    
    @Column(columnDefinition = "TEXT")
    private String sellerNote; // Pesan opsional untuk penjual

    // KUNCI UTAMA MIDTRANS: Menyimpan Token Pop-up Pembayaran!
    private String snapToken;

    // 🔥 VOUCHER TRACKING: Mencatat voucher apa yang dipakai di transaksi ini (Boleh Null jika tidak pakai)
    @ManyToOne // Banyak order bisa menggunakan satu voucher yang sama
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    // Daftar barang belanjaannya
    //  PENTING: mappedBy = "order" karena di OrderItem ada field 'order' yang menghubungkan ke sini. Cascade ALL supaya kalau order dihapus, item-itemnya juga ikut terhapus. OrphanRemoval true supaya kalau item dihapus dari list, dia juga terhapus dari database.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)  // Banyak order item masuk ke satu order
    @Builder.Default // Supaya kalau pakai builder, list ini tetap diinisialisasi sebagai ArrayList, bukan null.
    private List<OrderItem> orderItems = new ArrayList<>();
}