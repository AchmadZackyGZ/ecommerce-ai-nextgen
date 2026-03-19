package com.ecommerce.backend.dtos;

import lombok.Data;

@Data
public class AddressRequest {
    private String fullAddress;
    private String city;
    private String postalCode;
    private boolean isPrimary; // Apakah user ingin ini jadi alamat utama?
}