package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.CartItemRequest;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.ProductVariant;
import com.ecommerce.backend.repositories.ProductRepository;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;



@Component
public class CartTools {

    @Autowired
    private CartService cartService;

    // 🔥 KITA TAMBAHKAN RADAR GUDANG DI SINI
    @Autowired
    private ProductRepository productRepository; 

   // 🔥 PERBAIKAN: AI sekarang cukup mengirimkan Teks Nama Barang dan Angka Jumlah!
    @Tool("Gunakan fungsi ini SECARA WAJIB HANYA JIKA customer menyuruhmu memasukkan barang ke keranjang atau ingin membeli barang.")
    public String addItemToCart(
            @P("Nama produk yang ingin dibeli. Ambil langsung dari ucapan customer (Misal: 'iPhone 15 Pro Max').") String productName,
            @P("Jumlah kuantitas barang yang dipesan (wajib angka murni). Ekstrak dari ucapan customer (Misal: '2 buah' berarti 2).") Integer quantity) {

        System.out.println("🤖 [SYSTEM/ACTION]: Nexia mencoba memasukkan '" + productName + "' sebanyak " + quantity + " ke keranjang...");

        try {
            // 1. CARI PRODUKNYA DULU (Radar Gudang - Ini yang tadi terhapus!)
            Product foundProduct = productRepository.findAll().stream()
                    .filter(p -> p.getName().toLowerCase().contains(productName.toLowerCase()))
                    .findFirst()
                    .orElse(null);

            // Jika barang salah ketik / tidak ada
            if (foundProduct == null) {
                return "GAGAL: Produk dengan nama '" + productName + "' tidak ditemukan di gudang. Beritahu customer dengan sopan.";
            }

            // 🔥 EVOLUSI V1: Keranjang butuh VARIAN, bukan Produk Induk.
            // Kita suruh AI otomatis mengambil varian pertama dari produk yang ditemukan.
            if (foundProduct.getVariants() == null || foundProduct.getVariants().isEmpty()) {
                return "GAGAL: Produk " + productName + " belum memiliki varian yang bisa dibeli.";
            }
            ProductVariant selectedVariant = foundProduct.getVariants().get(0); 

            // 2. Ambil Email Customer dari Token
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            // 3. Masukkan ke Keranjang menggunakan ID VARIAN Asli
            CartItemRequest request = new CartItemRequest();
            request.setVariantId(selectedVariant.getId()); // 🔥 FIX: Menggunakan setVariantId
            request.setQuantity(quantity);

            cartService.addToCart(request, userEmail);

            return "SUKSES! " + quantity + " buah " + foundProduct.getName() + " (" + selectedVariant.getVariantName() + ") berhasil masuk keranjang.";

        } catch (Exception e) {
            return "GAGAL memasukkan ke keranjang. Alasan: " + e.getMessage();
        }
    }
}