package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private String transactionId;
    private Long orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String paymentStatus;
    private String message;
}