package com.ecommerce.backend.services;

import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.repositories.OrderRepository;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OrderTools {

    @Autowired
    private OrderRepository orderRepository;

    // 🔥 TOOL KEDUA: Radar Pelacak Pesanan
    @Tool("Fungsi pelacak status pesanan. DILARANG KERAS memanggil fungsi ini jika customer belum menyebutkan angka.")
    public String checkOrderStatus(
            @P("Nomor Order ID. WAJIB diambil langsung dari chat user. JANGAN PERNAH MENGARANG, MENEBAK, ATAU MEMAKAI ANGKA DUMMY (seperti 12345)!") Long orderId) {
        
        System.out.println("🤖 [SYSTEM]: Nexia sedang melacak pesanan dengan ID: " + orderId + "...");

        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isEmpty()) {
            return "Pesanan dengan ID " + orderId + " tidak ditemukan di sistem. Tolong minta customer mengecek kembali nomor pesanannya.";
        }

        Order order = orderOpt.get();
        String status = order.getStatus().name();
        String address = order.getShippingAddress();
        
        // Terjemahkan status untuk AI agar dia bisa menjelaskan dengan bahasa manusia
        return switch (status) {
            case "PENDING" -> "Status PENDING: Pesanan belum dibayar. Ingatkan customer untuk segera membayar ke Midtrans.";
            case "PAID" -> "Status PAID: Pembayaran sukses! Barang sedang diproses oleh Seller untuk dikirim ke alamat: " + address;
            case "SHIPPED" -> "Status SHIPPED: Barang sedang dalam perjalanan kurir menuju alamat: " + address;
            case "COMPLETED" -> "Status COMPLETED: Barang sudah diterima oleh customer. Ucapkan terima kasih dan minta mereka memberikan review bintang 5.";
            case "CANCELLED" -> "Status CANCELLED: Pesanan dibatalkan.";
            default -> "Status: " + status;
        };
    }
}