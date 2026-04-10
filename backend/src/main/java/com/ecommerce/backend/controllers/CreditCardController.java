package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.CreditCardRequest;
import com.ecommerce.backend.dtos.CreditCardResponse;
import com.ecommerce.backend.services.CreditCardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cards")
public class CreditCardController {

    @Autowired
    private CreditCardService creditCardService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreditCardResponse>> addCard(
            @RequestBody CreditCardRequest request,
            Principal principal) {
        
        CreditCardResponse responseData = creditCardService.addCard(request, principal.getName());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CreditCardResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Kartu kredit berhasil ditambahkan dengan aman!")
                        .data(responseData)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CreditCardResponse>>> getUserCards(Principal principal) {
        List<CreditCardResponse> cards = creditCardService.getUserCards(principal.getName());
        
        return ResponseEntity.ok(
                ApiResponse.<List<CreditCardResponse>>builder()
                        .status(HttpStatus.OK.value())
                        .message("Berhasil mengambil data kartu.")
                        .data(cards)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCard(@PathVariable Long id, Principal principal) {
        creditCardService.deleteCard(id, principal.getName());
        
        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .status(HttpStatus.OK.value())
                        .message("Kartu berhasil dihapus dari sistem.")
                        .data(null)
                        .build()
        );
    }
}