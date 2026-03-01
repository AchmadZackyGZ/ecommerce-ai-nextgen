package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ReviewResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.*;
import com.ecommerce.backend.repositories.OrderRepository;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ReviewRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // --- 1. FITUR MENAMBAH REVIEW & UPLOAD FOTO ---
    public ReviewResponse addReview(Long productId, Integer rating, String comment, MultipartFile image, String userEmail) {
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan!"));

        // 🔥 VALIDASI 1: Apakah user sudah pernah mereview barang ini?
        if (reviewRepository.existsByProductAndUser(product, user)) {
            throw new BadRequestException("Anda sudah memberikan ulasan untuk produk ini!");
        }

        // 🔥 VALIDASI 2: Apakah user BENAR-BENAR sudah membeli barang ini dan statusnya COMPLETED?
        boolean hasBought = orderRepository.findByUser(user).stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .flatMap(order -> order.getOrderItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(productId));

        if (!hasBought) {
            throw new BadRequestException("Ditolak! Anda belum pernah membeli barang ini atau pesanan belum Selesai (COMPLETED).");
        }

        // 🔥 VALIDASI 3: Batas Bintang
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating harus berada di antara 1 hingga 5 bintang!");
        }

        // 🚀 PROSES UPLOAD GAMBAR KE CLOUDINARY (Jika ada file yang dikirim)
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        // Eksekusi Simpan ke Database
        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(rating)
                .comment(comment)
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        return mapToReviewResponse(savedReview);
    }

    // --- 2. FITUR MELIHAT DAFTAR REVIEW (Untuk Halaman Produk) ---
    public List<ReviewResponse> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan!"));

        return reviewRepository.findByProduct(product).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    // Fungsi Pembantu untuk mengubah Entitas menjadi DTO
    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .customerName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .createdAt(review.getCreatedAt())
                .build();
    }
}