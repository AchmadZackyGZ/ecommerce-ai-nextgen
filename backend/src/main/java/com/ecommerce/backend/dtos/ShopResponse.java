package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data // Otomatis membuatkan Getter, Setter, toString dari Lombok
@Builder // Memudahkan kita membuat object ShopResponse nanti
public class ShopResponse {
    private Long id;
    private String name;
    private String description;
    private String ownerName; // Nama pemilik toko
    private LocalDateTime createdAt;
}