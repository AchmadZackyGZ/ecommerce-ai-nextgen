package com.ecommerce.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false)
    private String recipientName; // Nama Lengkap Penerima

    @Column(nullable = false)
    private String phoneNumber; // Nomor Telepon

    @Column(nullable = false)
    private String province; // Provinsi
    
    @Column(nullable = false)
    private String city; // Kota/Kabupaten
    
    @Column(nullable = false)
    private String district; // Kecamatan
    
    @Column(nullable = false)
    private String postalCode; // Kode Pos

    @Column(nullable = false, columnDefinition = "TEXT")
    private String streetDetails; // Nama Jalan, Gedung, No. Rumah

    @Column(columnDefinition = "TEXT")
    private String otherDetails; // Patokan / Detail Lainnya (Bisa kosong)

    @Column(nullable = false)
    private String label; // Cth: "Rumah" atau "Kantor"

    @Column(nullable = false)
    private boolean isPrimary; // Menandai alamat utama

    // 🔥 FIX ERROR: FUNGSI PERAKIT ALAMAT OTOMATIS (Computed Property)
    // Dengan fungsi ini, OrderService dan OrderTools tidak akan error lagi!
    public String getFullAddress() {
        String baseAddress = streetDetails;
        
        // Jika ada patokan / other details, tambahkan di dalam kurung
        if (otherDetails != null && !otherDetails.trim().isEmpty()) {
            baseAddress += " (" + otherDetails + ")";
        }
        
        // Rakit menjadi format: Jalan (Patokan), Kecamatan, Kota, Provinsi KodePos
        return baseAddress + ", " + district + ", " + city + ", " + province + " " + postalCode;
    }
}