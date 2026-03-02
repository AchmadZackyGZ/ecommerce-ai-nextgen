package com.ecommerce.backend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class AiConfig {
    
    @Value("${ai.groq.api-key}")
    private String apiKey;

    @Value("${ai.groq.base-url}")
    private String baseUrl;

    @Value("${ai.groq.model-name}")
    private String modelName;

    // mendaftarkan Model AI ke dalam Ekosistem Spring boot
    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .modelName(modelName)
                .temperature(0.7) // sedikit kreatif, tapi tetap fokus jualan
                .timeout(Duration.ofSeconds(60)) // Atur timeout sesuai kebutuhan
                .build();
    }
}
