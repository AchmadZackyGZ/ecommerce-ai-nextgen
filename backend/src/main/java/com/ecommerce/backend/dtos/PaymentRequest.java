package com.ecommerce.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long orderId;
    private String paymentMethod; // Contoh: BCA_VA, GOPAY, SHOPEEPAY
    private BigDecimal amount;    // Jumlah uang yang ditransfer (Harus pas!)
}