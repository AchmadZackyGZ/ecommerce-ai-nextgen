package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder // Agar bisa membuat objek VoucherResponse dengan cara yang lebih mudah, seperti: VoucherResponse.builder().build();
public class VoucherResponse {
    private Long id;
    private String code;
    private Integer discountPercentage;   // 🔥 Diubah
    private BigDecimal maxDiscountAmount; // 🔥 Ditambah
    private Integer quota;
    private LocalDateTime expiredAt;
    private String shopName; // Kita tampilkan nama toko pembuatnya
}