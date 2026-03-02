package com.ecommerce.backend.services;

import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.repositories.ProductRepository;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component // Kelas ini berisi fungsi-fungsi yang bisa dipanggil oleh AI untuk mengecek stok, harga, dll di toko kita
public class StoreTools {

    @Autowired
    private ProductRepository productRepository;

    // 🔥 INILAH KEAJAIBANNYA: Anotasi @Tool memberitahu AI kapan harus memakai fungsi ini
    @Tool("Gunakan fungsi ini SECARA WAJIB ketika Customer bertanya tentang daftar barang, mencari produk, mengecek harga, atau mengecek sisa stok di toko.")
    public String checkStoreInventory() {
        System.out.println("[SYSTEM]: Nexia sedang mengecek database gudang...");
        
        List<Product> products = productRepository.findAll();
        
        if (products.isEmpty()) {
            return "Katalog kosong. Tidak ada barang yang dijual saat ini.";
        }

        // Kita ubah data database menjadi teks sederhana agar mudah dibaca oleh AI
        return products.stream()
                .map(p -> "- [ID: " + p.getId() + "] " + p.getName() + " (Harga: Rp " + p.getPrice() + ", Stok: " + p.getStock() + ")")
                .collect(Collectors.joining("\n"));
    }
}