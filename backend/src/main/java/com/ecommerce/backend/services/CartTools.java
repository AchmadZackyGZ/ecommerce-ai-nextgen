package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.CartItemRequest;
import com.ecommerce.backend.dtos.CartResponse;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CartTools {

    @Autowired
    private CartService cartService;

    // 🔥 TOOL KETIGA: Eksekutor Keranjang Belanja
    @Tool("Gunakan fungsi ini SECARA WAJIB HANYA JIKA customer menyuruhmu untuk memasukkan barang ke keranjang atau berkata ingin membeli barang tertentu.")
    public String addItemToCart(
            @P("ID Produk (angka) yang ingin dibeli. Jika kamu belum tahu ID-nya, gunakan tool StoreTools dulu untuk melihat ID produk di katalog.") Long productId,
            @P("Jumlah barang yang ingin dimasukkan. Jika customer tidak menyebutkan jumlahnya, isi defaultnya adalah 1.") Integer quantity) {

        System.out.println("🤖 [SYSTEM/ACTION]: Nexia sedang memasukkan produk ID " + productId + " ke keranjang customer...");

        try {
            // 🔥 TRIK ENTERPRISE: Mengambil email Customer langsung dari JWT Token yang sedang login!
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            // Membangun Request seperti yang dilakukan di Controller
            CartItemRequest request = new CartItemRequest();
            request.setProductId(productId);
            request.setQuantity(quantity);

            // Memanggil CartService yang sudah Anda buat sebelumnya
            CartResponse cart = cartService.addToCart(request, userEmail);
            
            // Mengembalikan status sukses ke Otak AI agar dia bisa merangkai kata
            return "SUKSES! Barang berhasil dimasukkan ke keranjang. Total tagihan di keranjang saat ini: Rp " + cart.getTotalPrice() + 
                   ". Tugas AI: Sampaikan kabar gembira ini ke customer dan tawarkan apakah mau langsung checkout atau mau tambah barang lain.";

        } catch (Exception e) {
            // Jika stok habis atau ada error lain (misal mencoba beli barang sendiri)
            return "GAGAL memasukkan ke keranjang. Alasan: " + e.getMessage() + 
                   ". Tugas AI: Sampaikan masalah ini ke customer dengan ramah dan penuh empati.";
        }
    }
}