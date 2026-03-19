package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductVariantResponse {
    private Long id;
    private String variantName;
    private BigDecimal priceModifier;
    private Integer stock;
}