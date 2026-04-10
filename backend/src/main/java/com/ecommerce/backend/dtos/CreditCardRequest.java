package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class CreditCardRequest {
    private String maskedNumber;
    private String bankName;
    private String cardType;
    private String savedTokenId;
}