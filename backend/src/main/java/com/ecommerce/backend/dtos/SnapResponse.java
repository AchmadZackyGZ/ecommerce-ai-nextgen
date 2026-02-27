package com.ecommerce.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SnapResponse {
    private String token;
    private String redirectUrl;
}
