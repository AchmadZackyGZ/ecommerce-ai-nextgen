package com.ecommerce.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequest {
    private String code;
    private Integer discountPercentage;   // 🔥 Diubah
    private BigDecimal maxDiscountAmount; // 🔥 Ditambah
    private Integer quota;
    private LocalDateTime expiredAt; // Format JSON nantinya: "2026-12-31T23:59:59"
}