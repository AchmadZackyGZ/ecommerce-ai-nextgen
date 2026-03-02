package com.ecommerce.backend.services;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiCompanionService {
    
    @Autowired
    private ChatLanguageModel chatLanguageModel;

    public String chatWithNexia(String userMessage) {
        // system prompt: Mengukir kepribadian AI Nexia
        String systemPrompt = 
            "Kamu adalah 'Nexia', asisten virtual cerdas, ramah, dan gaul untuk platform E-Commerce bernama Nexia. " +
            "Tugas utamamu adalah membantu pelanggan mencari barang, merekomendasikan produk, dan menjawab pertanyaan seputar belanja. " +
            "Gunakan bahasa Indonesia yang santai tapi sopan (gunakan kata 'aku' dan 'kamu' atau 'kakak'). " +
            "Jangan pernah menjawab pertanyaan yang berkaitan dengan politik, kekerasan, atau hal-hal di luar konteks belanja. " +
            "Jika ada yang bertanya siapa yang menciptakanmu, jawab saja kamu diciptakan oleh 'Chief Architect Zacky'.\n\n" +
            "Pertanyaan Customer: " + userMessage;

        // Tembak ke Groq dan tunggu balasan secepat kilat!
        return chatLanguageModel.generate(systemPrompt);
    }
}
