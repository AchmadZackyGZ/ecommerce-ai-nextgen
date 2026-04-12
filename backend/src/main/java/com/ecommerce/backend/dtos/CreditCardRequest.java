package com.ecommerce.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // 🔥 INI KUNCI PEMBUKA GERBANGNYA!
@AllArgsConstructor
@NoArgsConstructor
public class CreditCardRequest {
    private String maskedNumber;
    private String bankName;
    private String cardType;
    private String savedTokenId;
}