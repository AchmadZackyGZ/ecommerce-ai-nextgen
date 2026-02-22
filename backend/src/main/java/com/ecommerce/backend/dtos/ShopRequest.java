package com.ecommerce.backend.dtos;

import lombok.Data;

@Data // Otomatis membuatkan Getter, Setter, toString dari Lombok
public class ShopRequest {
    private String name;
    private String description;
}