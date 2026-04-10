package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.CreditCardRequest;
import com.ecommerce.backend.dtos.CreditCardResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.CreditCard;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.CreditCardRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditCardService {

    @Autowired 
    private CreditCardRepository creditCardRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔥 FITUR SIMPAN KARTU DENGAN KEAMANAN MAKSIMAL
    public CreditCardResponse addCard(CreditCardRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // ATURAN 1: Maksimal 3 Kartu
        if (creditCardRepository.countByUser(user) >= 3) {
            throw new BadRequestException("Batas maksimal tercapai! Anda hanya boleh menyimpan maksimal 3 kartu.");
        }

        // ATURAN 2: Cegah Kartu Duplikat
        if (creditCardRepository.existsBySavedTokenId(request.getSavedTokenId())) {
            throw new BadRequestException("Kartu ini sudah terdaftar di sistem Nexia.");
        }

        CreditCard newCard = CreditCard.builder()
                .user(user)
                .maskedNumber(request.getMaskedNumber())
                .bankName(request.getBankName())
                .cardType(request.getCardType())
                .savedTokenId(request.getSavedTokenId())
                .build();

        CreditCard savedCard = creditCardRepository.save(newCard);
        return mapToResponse(savedCard);
    }

    // FITUR LIHAT KARTU
    public List<CreditCardResponse> getUserCards(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        return creditCardRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // FITUR HAPUS KARTU
    public void deleteCard(Long cardId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Kartu tidak ditemukan!"));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Akses Ditolak!");
        }

        creditCardRepository.delete(card);
    }

    // Helper Mapper
    private CreditCardResponse mapToResponse(CreditCard card) {
        return CreditCardResponse.builder()
                .id(card.getId())
                .maskedNumber(card.getMaskedNumber())
                .bankName(card.getBankName())
                .cardType(card.getCardType())
                .build();
    }
}