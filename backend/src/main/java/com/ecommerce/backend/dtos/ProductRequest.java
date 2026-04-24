package com.ecommerce.backend.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String category; // tambah field kategori di DTO request untuk menerima input kategori dari frontend
    private String description;
    private BigDecimal price;
    private Integer stock;
    private List<String> imageUrls;
}
