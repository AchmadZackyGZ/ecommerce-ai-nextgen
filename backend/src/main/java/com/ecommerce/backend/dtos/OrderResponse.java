package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private String customerName;
    private String shippingAddress;
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private String status;
    private LocalDateTime orderDate;
    private String voucherCodeUsed; // Null jika tidak pakai
    private List<OrderItemResponse> items;
}