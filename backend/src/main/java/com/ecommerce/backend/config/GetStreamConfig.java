package com.ecommerce.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "getstream.api")
@Data // Dari Lombok, otomatis buatkan getter setter
public class GetStreamConfig {
    private String key;    // Otomatis map ke getstream.api.key
    private String secret; // Otomatis map ke getstream.api.secret
}
