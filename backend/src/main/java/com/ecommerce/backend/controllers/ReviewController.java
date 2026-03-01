package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ReviewResponse;
import com.ecommerce.backend.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 1. API: Menambah Review (HANYA CUSTOMER YANG BISA)
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @RequestParam("productId") Long productId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal
    ) {
        ReviewResponse review = reviewService.addReview(productId, rating, comment, image, principal.getName());

        ApiResponse<ReviewResponse> response = ApiResponse.<ReviewResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Review beserta foto berhasil diunggah! Terima kasih atas ulasan Anda.")
                .data(review)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. API: Melihat Daftar Review (TERBUKA UNTUK UMUM)
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getProductReviews(productId);

        ApiResponse<List<ReviewResponse>> response = ApiResponse.<List<ReviewResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat ulasan produk.")
                .data(reviews)
                .build();

        return ResponseEntity.ok(response);
    }
}