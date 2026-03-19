package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String fullAddress;
    private String city;
    private String postalCode;
    private boolean isPrimary;
}