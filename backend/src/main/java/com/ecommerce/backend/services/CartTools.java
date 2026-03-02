package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.CartItemRequest;
import com.ecommerce.backend.dtos.CartResponse;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.repositories.ProductRepository;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

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
            // 1. JAVA YANG BEKERJA: Mencari ID Produk berdasarkan Nama yang diketik AI
            List<Product> products = productRepository.findAll();
            Product foundProduct = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(productName.toLowerCase()))
                    .findFirst()
                    .orElse(null);

            // Jika barang salah ketik / tidak ada
            if (foundProduct == null) {
                return "GAGAL: Produk dengan nama '" + productName + "' tidak ditemukan di gudang. Beritahu customer dengan ramah.";
            }

            // 2. Ambil Email Customer dari Token
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            // 3. Masukkan ke Keranjang menggunakan ID asli yang ditemukan Java
            CartItemRequest request = new CartItemRequest();
            request.setProductId(foundProduct.getId());
            request.setQuantity(quantity);

            CartResponse cart = cartService.addToCart(request, userEmail);
            
            return "SUKSES! " + quantity + " buah " + foundProduct.getName() + " berhasil masuk keranjang. Total tagihan: Rp " + cart.getTotalPrice() + ". Beritahu customer kabar baik ini!";

        } catch (Exception e) {
            return "GAGAL memasukkan ke keranjang. Alasan: " + e.getMessage();
        }
    }
}