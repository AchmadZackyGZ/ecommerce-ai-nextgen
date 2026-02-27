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
}