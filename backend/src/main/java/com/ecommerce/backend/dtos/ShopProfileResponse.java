package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ShopProfileResponse {
    // 1. Info Utama Toko (Header)
    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private String imageBannerUrl; // Opsional
    private String videoBannerUrl; // Opsional
    
    // 2. Statistik Toko
    private Integer responseRate;
    private Double averageRating;
    private Integer totalProducts;
    private String joinDate;
    private String lastActive;

    // 3. Data Pendukung Section
    private List<VoucherResponse> activeVouchers; // Untuk Section Voucher
    private List<ProductResponse> featuredProducts; // Untuk Section Produk Unggulan (Top 5)
    // (Daftar produk keseluruhan akan kita panggil dari endpoint produk dengan filter shop_id agar bisa di-pagnasi/kategori nantinya)
}