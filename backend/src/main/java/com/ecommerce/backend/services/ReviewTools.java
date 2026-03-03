package com.ecommerce.backend.services;

import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.Review;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ReviewRepository;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReviewTools {

    @Autowired 
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    // 🔥 TOOL KEEMPAT: Penganalisis Ulasan Pelanggan
    @Tool("Gunakan fungsi ini SECARA WAJIB HANYA JIKA customer bertanya tentang review, ulasan, rating, kualitas, atau pendapat pembeli lain tentang suatu barang.")
    public String getProductReviews(
            @P("Nama produk yang ditanyakan ulasannya. Ekstrak langsung dari ucapan customer.") String productName) {

        System.out.println("🤖 [SYSTEM/ANALYSIS]: Nexia sedang membaca review untuk produk '" + productName + "'...");

        try {
            // 1. Cari Produk (Sama seperti logika CartTools)
            List<Product> products = productRepository.findAll();
            Product foundProduct = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(productName.toLowerCase()))
                    .findFirst()
                    .orElse(null);

            if (foundProduct == null) {
                return "Produk '" + productName + "' tidak ditemukan. Beritahu customer dengan ramah.";
            }

            // 2. Tarik semua Review untuk Produk tersebut
            // ⚠️ CATATAN: Pastikan Anda punya method findByProductId(Long id) di ReviewRepository!
            List<Review> reviews = reviewRepository.findByProductId(foundProduct.getId());

            if (reviews == null || reviews.isEmpty()) {
                return "Belum ada ulasan untuk produk " + foundProduct.getName() + " ini. Yakinkan customer untuk menjadi pembeli pertama yang memberikan review bintang 5!";
            }

            // 3. Rangkum mentahan data untuk dibaca otak AI
            double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            String reviewTexts = reviews.stream()
                    .map(r -> "- Bintang " + r.getRating() + ": \"" + r.getComment() + "\"")
                    .collect(Collectors.joining("\n"));

            // 4. Lempar data ini ke AI agar AI yang memformulasikan kalimatnya!
            return "Produk: " + foundProduct.getName() + "\n" +
                   "Total Ulasan: " + reviews.size() + " ulasan\n" +
                   "Rata-rata Rating: " + String.format("%.1f", averageRating) + " dari 5.0\n" +
                   "Komentar Pembeli:\n" + reviewTexts + "\n\n" +
                   "TUGAS AI: Buatlah kesimpulan (rangkuman) singkat dari ulasan-ulasan di atas dengan gaya bahasa yang asyik, dan sampaikan ke customer untuk meyakinkan mereka!";

        } catch (Exception e) {
            return "Gagal mengambil data review: " + e.getMessage();
        }
    }
}