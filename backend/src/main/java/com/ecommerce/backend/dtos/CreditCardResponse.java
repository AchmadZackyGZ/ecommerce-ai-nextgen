package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreditCardResponse {
    private Long id;
    private String maskedNumber;
    private String bankName;
    private String cardType;
    // Token ID tidak perlu dikirim kembali ke UI profil untuk alasan keamanan tambahan,
    // cukup ID internal database kita saja untuk keperluan hapus (Delete)
}