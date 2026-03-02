package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.AiChatRequest;
import com.ecommerce.backend.dtos.AiChatResponse;
import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.services.AiCompanionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    @Autowired
    private AiCompanionService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@RequestBody AiChatRequest request) {
        // Panggil otak AI kita
        String reply = aiService.chatWithNexia(request.getMessage());

        AiChatResponse chatResponse = AiChatResponse.builder()
                .reply(reply)
                .build();
        
        ApiResponse<AiChatResponse> response = ApiResponse.<AiChatResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Nexia berhasil merespon pertanyaanmu!")
                .data(chatResponse)
                .build();

        return ResponseEntity.ok(response);

    }
}
