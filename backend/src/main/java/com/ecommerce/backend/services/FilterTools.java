package com.ecommerce.backend.services;

import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.repositories.ProductRepository;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component // Kelas ini berisi fungsi-fungsi yang bisa dipanggil oleh AI untuk memfilter produk berdasarkan budget customer
public class FilterTools {

    @Autowired // Kita butuh akses ke database produk untuk memfilter berdasarkan harga
    private ProductRepository productRepository;

    // 🔥 TOOL KELIMA: Radar Filter Budget
    @Tool("Gunakan fungsi ini SECARA WAJIB HANYA JIKA customer mencari barang berdasarkan budget tertentu, batas harga maksimal, atau mencari barang termurah/di bawah harga tertentu.")
    public String filterProductsByBudget(
            @P("Batas harga maksimal (budget) dalam bentuk angka murni. Ekstrak dari ucapan customer (Misal: 'di bawah 20 juta' berarti 20000000).") Double maxPrice) {

        System.out.println("🤖 [SYSTEM/FILTER]: Nexia sedang memfilter katalog untuk budget di bawah Rp " + maxPrice + "...");

        try {
            // Mengambil semua produk dan memfilternya berdasarkan harga (budget)
            List<Product> affordableProducts = productRepository.findAll().stream()
                    .filter(p -> p.getPrice().compareTo(BigDecimal.valueOf(maxPrice)) <= 0)
                    .collect(Collectors.toList());

            if (affordableProducts.isEmpty()) {
                return "Tidak ada produk yang harganya di bawah Rp " + maxPrice + ". Tugas AI: Beritahu customer dengan sopan dan sarankan untuk menaikkan budget mereka agar bisa membeli produk premium kita.";
            }

            // Merangkum produk yang masuk budget
            String result = affordableProducts.stream()
                    .map(p -> "- " + p.getName() + " (Harga: Rp " + p.getPrice() + ")")
                    .collect(Collectors.joining("\n"));

            return "Produk yang sesuai budget customer:\n" + result + 
                   "\n\nTUGAS AI: Berikan rekomendasi produk-produk di atas kepada customer dengan bahasa yang elegan dan meyakinkan!";

        } catch (Exception e) {
            return "Gagal memfilter produk: " + e.getMessage();
        }
    }
}