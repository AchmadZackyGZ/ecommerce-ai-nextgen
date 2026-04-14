package com.ecommerce.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@Data // Dari Lombok, otomatis buatkan getter setter
public class GetStreamConfig {

    @Value("${getstream.api.key}")
    private String key;    // Otomatis map ke getstream.api.key

    @Value("${getstream.api.secret}")
    private String secret; // Otomatis map ke getstream.api.secret
}
