package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String province;
    private String city;
    private String district;
    private String postalCode;
    private String streetDetails;
    private String otherDetails;
    private String label;
    private boolean isPrimary;
}