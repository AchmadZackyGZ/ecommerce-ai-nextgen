package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.PaymentRequest;
import com.ecommerce.backend.dtos.PaymentResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.models.OrderStatus;
import com.ecommerce.backend.models.Payment;
import com.ecommerce.backend.repositories.OrderRepository;
import com.ecommerce.backend.repositories.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.midtrans.httpclient.SnapApi;
import com.midtrans.httpclient.error.MidtransError;
import com.ecommerce.backend.dtos.SnapResponse;
import com.ecommerce.backend.dtos.MidtransNotificationRequest;
import java.util.HashMap;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, String userEmail) {

        // 1. Cari Struk Pesanannya
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan!"));

        // 2. VALIDASI ANTI-HACKER: Pastikan pesanan ini benar-benar milik user yang sedang login!
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa membayar pesanan milik orang lain!");
        }

        // 3. VALIDASI STATUS: Pastikan masih PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Pembayaran gagal: Pesanan ini sudah berstatus " + order.getStatus().name());
        }

        // 4. VALIDASI JUMLAH UANG: Uang yang ditransfer harus SAMA PERSIS dengan grandTotal
        if (request.getAmount().compareTo(order.getGrandTotal()) != 0) {
            throw new BadRequestException("Pembayaran gagal: Jumlah uang tidak sesuai dengan total tagihan! Tagihan Anda: Rp " + order.getGrandTotal());
        }

        // 5. SIMULASI MIDTRANS: Buat nomor resi acak ala Midtrans
        String fakeMidtransId = "TRX-MID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 6. Cetak Bukti Kwitansi (Payment)
        Payment payment = Payment.builder()
                .order(order)
                .transactionId(fakeMidtransId)
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .amount(request.getAmount())
                .paymentDate(LocalDateTime.now())
                .paymentStatus("SUCCESS")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 7. 🔥 MOMEN KRUSIAL: UBAH STATUS ORDER MENJADI PAID 🔥
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        // 8. Berikan kembalian JSON
        return PaymentResponse.builder()
                .transactionId(savedPayment.getTransactionId())
                .orderId(order.getId())
                .paymentMethod(savedPayment.getPaymentMethod())
                .amount(savedPayment.getAmount())
                .paymentDate(savedPayment.getPaymentDate())
                .paymentStatus(savedPayment.getPaymentStatus())
                .message("Pembayaran Berhasil! Pesanan Anda segera diproses oleh Penjual.")
                .build();
    }

    // --- FITUR BARU: MINTA TOKEN SNAP KE MIDTRANS ---
    public SnapResponse createSnapToken(Long orderId, String userEmail) {
        
        // 1. Cari pesanannya dan validasi keamanan
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan!"));

        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa membayar pesanan orang lain!");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Pesanan tidak bisa dibayar karena statusnya: " + order.getStatus().name() + "Pesanan Wajib PENDING untuk bisa dibayar!");
        }

        try {
            // 2. Siapkan "Surat Pengantar" (Payload/Params) untuk dikirim ke Midtrans
            Map<String, Object> params = new HashMap<>();

            // A. Rincian Transaksi
            Map<String, String> transactionDetails = new HashMap<>();
            // 🔥 Trik Arsitek: Midtrans mewajibkan order_id HARUS UNIK setiap kali request. 
            // Kita tambahkan System.currentTimeMillis() agar kalau User gagal bayar dan coba lagi, tidak ditolak Midtrans.
            String uniqueOrderId = "ORD-" + order.getId() + "-" + System.currentTimeMillis();
            transactionDetails.put("order_id", uniqueOrderId);
            // Nilai total belanja (harus berupa String integer, Midtrans tidak suka desimal berlebih)
            transactionDetails.put("gross_amount", String.valueOf(order.getGrandTotal().intValue())); 

            // B. Rincian Customer
            Map<String, String> customerDetails = new HashMap<>();
            customerDetails.put("first_name", order.getUser().getName());
            customerDetails.put("email", order.getUser().getEmail());

            // Masukkan ke dalam amplop utama
            params.put("transaction_details", transactionDetails);
            params.put("customer_details", customerDetails);

            // 3. 🔥 TEMBAK KE SERVER MIDTRANS! 🔥
            String token = SnapApi.createTransactionToken(params);
            String redirectUrl = SnapApi.createTransactionRedirectUrl(params);

            // 4. Kembalikan balasan dari Midtrans
            return SnapResponse.builder()
                    .token(token)
                    .redirectUrl(redirectUrl)
                    .build();

        } catch (MidtransError e) {
            // Kalau server Midtrans sedang gangguan / key salah
            throw new RuntimeException("Gagal menghubungi server Midtrans: " + e.getMessage());
        }
    }

    // --- FITUR BARU: MENANGKAP SINYAL WEBHOOK DARI MIDTRANS ---
    @Transactional // Pastikan semua operasi database di dalam method ini berjalan atomik
    public void processMidtransNotification(MidtransNotificationRequest notification) {
        String transactionStatus = notification.getTransactionStatus();
        String fraudStatus = notification.getFraudStatus();
        String midtransOrderId = notification.getOrderId(); // Format: ORD-1-1772xxx

        // 🔥 TRIK ARSITEK: Bedah string "ORD-1-12345" untuk mengambil angka "1" (ID asli di database kita)
        String[] parts = midtransOrderId.split("-");
        if (parts.length < 2) {
            throw new RuntimeException("Format Order ID Midtrans tidak dikenali: " + midtransOrderId);
        }
        Long realOrderId = Long.parseLong(parts[1]);

        // Cari pesanannya di database
        Order order = orderRepository.findById(realOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan dari Webhook!"));

        // Logika Status Pembayaran Midtrans
        if (transactionStatus.equals("settlement") || transactionStatus.equals("capture")) {
            if (fraudStatus != null && fraudStatus.equals("challenge")) {
                // Jangan diapa-apakan, nunggu review manual Midtrans
            } else {
                // 💥 UANG MASUK! UBAH STATUS ORDER JADI PAID 💥
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                    
                    // Cetak Kwitansi Digital (Optional, agar history rapi)
                    Payment payment = Payment.builder()
                            .order(order)
                            .transactionId(midtransOrderId)
                            .paymentMethod(notification.getPaymentType())
                            .amount(order.getGrandTotal())
                            .paymentDate(LocalDateTime.now())
                            .paymentStatus("SUCCESS")
                            .build();
                    paymentRepository.save(payment);
                }
            }
        } else if (transactionStatus.equals("cancel") || transactionStatus.equals("deny") || transactionStatus.equals("expire")) {
            // Jika pembayaran gagal / kadaluarsa
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }
    }
}