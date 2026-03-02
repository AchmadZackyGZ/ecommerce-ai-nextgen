package com.ecommerce.backend.dtos;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class AiChatResponse {
    private String reply; // jawaban dari AI untuk pertanyaan customer
}
