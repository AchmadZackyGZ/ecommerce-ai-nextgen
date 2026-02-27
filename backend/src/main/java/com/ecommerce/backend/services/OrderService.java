package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.OrderItemResponse;
import com.ecommerce.backend.dtos.OrderRequest;
import com.ecommerce.backend.dtos.OrderResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.*;
import com.ecommerce.backend.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ShopRepository shopRepository;

    // 🔥 @Transactional WAJIB ADA! 
    // Artinya: Jika di tengah jalan gagal (misal stok habis), semua perubahan ditarik mundur (Rollback)!
    @Transactional
    public OrderResponse checkout(OrderRequest request, String userEmail) {
        
        // 1. Cari User dan Keranjangnya
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Keranjang belanja Anda masih kosong! Tidak bisa checkout.");
        }

        // 2. Hitung SubTotal Murni (Harga Asli Barang x Kuantitas)
        BigDecimal subTotal = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. LOGIKA VOUCHER 
        BigDecimal discount = BigDecimal.ZERO;
        Voucher validVoucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            validVoucher = voucherRepository.findByCode(request.getVoucherCode().toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Kode voucher tidak valid!"));

            // Validasi: Apakah sudah expired?
            if (validVoucher.getExpiredAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Voucher sudah kadaluarsa!");
            }
            // Validasi: Apakah kuota masih ada?
            if (validVoucher.getQuota() <= 0) {
                throw new BadRequestException("Kuota voucher sudah habis!");
            }

            // 🔥 RUMUS PERSENTASE: (SubTotal * Persen) / 100
            BigDecimal percentageDecimal = new BigDecimal(validVoucher.getDiscountPercentage());
            BigDecimal calculatedDiscount = subTotal.multiply(percentageDecimal)
                    .divide(new BigDecimal(100), RoundingMode.HALF_UP);

            // 🔥 LOGIKA SHOPEE: Bandingkan dengan Maksimal Potongan!
            // Jika calculatedDiscount LEBIH BESAR dari maxDiscountAmount, paksa turun ke maxDiscountAmount
            if (calculatedDiscount.compareTo(validVoucher.getMaxDiscountAmount()) > 0) {
                discount = validVoucher.getMaxDiscountAmount();
            } else {
                discount = calculatedDiscount;
            }

            // Potong kuota voucher (Karena sudah berhasil dipakai)
            validVoucher.setQuota(validVoucher.getQuota() - 1);
            voucherRepository.save(validVoucher);
        }

        // 4. Hitung Grand Total (Yang wajib dibayar)
        BigDecimal grandTotal = subTotal.subtract(discount);
        
        // Pencegahan ekstra aman (Grand Total tidak boleh minus)
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

        // 5. Cetak Kepala Struk (Order)
        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .subTotal(subTotal)
                .discount(discount)
                .grandTotal(grandTotal)
                .status(OrderStatus.PENDING) // Status awal selalu PENDING (Belum dibayar)
                .orderDate(LocalDateTime.now())
                .voucher(validVoucher)
                .build();
        
        Order savedOrder = orderRepository.save(order);

        // 6. Cetak Rincian Barang (OrderItem) & POTONG STOK TOKO
        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            
            // Validasi Stok (Siapa tahu saat checkout, barang sudah dibeli orang lain!)
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Gagal Checkout! Stok produk '" + product.getName() + "' tidak mencukupi. Sisa stok: " + product.getStock());
            }

            // Eksekusi Potong Stok
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product); // Simpan sisa stok baru

            return OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice()) // Bekukan harga saat ini
                    .build();
        }).collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);

        // 7. SAPU BERSIH KERANJANG! (Checkout sukses, keranjang harus kosong)
        cartItemRepository.deleteAll(cartItems);
        cart.getCartItems().clear(); // Kosongkan list di memori juga

        // 8. Berikan kembalian JSON
        return mapToOrderResponse(savedOrder, orderItems);
    }

    // --- 2. FITUR MELIHAT RIWAYAT PESANAN (ORDER HISTORY) ---
    public List<OrderResponse> getUserOrderHistory(String userEmail) {
        // 1. Cari user yang sedang login
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // 2. Ambil semua struk pesanan milik user ini dari database
        List<Order> orders = orderRepository.findByUser(user);

        // 3. Ubah Entitas Order menjadi DTO OrderResponse menggunakan fungsi helper kita
        return orders.stream()
                .map(order -> mapToOrderResponse(order, order.getOrderItems()))
                .collect(Collectors.toList());
    }

    // --- 3. FITUR SELLER: MELIHAT DAFTAR PESANAN MASUK ---
    public List<OrderResponse> getShopOrders(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));
        
        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko!"));

        // Ambil semua order yang masuk ke toko ini
        List<Order> shopOrders = orderRepository.findOrdersByShop(shop);

        return shopOrders.stream()
                .map(order -> mapToOrderResponse(order, order.getOrderItems()))
                .collect(Collectors.toList());
    }

    // --- 4. FITUR SELLER: MEMPROSES PENGIRIMAN BARANG (SHIPPED) ---
    @Transactional
    public OrderResponse shipOrder(Long orderId, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));
        
        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko!"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan!"));

        // 🔥 VALIDASI KEAMANAN: Pastikan pesanan ini benar-benar memuat barang dari toko si Seller!
        boolean isOwner = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getShop().getId().equals(shop.getId()));

        if (!isOwner) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa memproses pesanan toko lain!");
        }

        // 🔥 VALIDASI LOGIKA: Hanya pesanan yang sudah dibayar (PAID) yang boleh dikirim!
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Gagal dikirim! Pesanan ini berstatus " + order.getStatus().name() + ". Harus dibayar (PAID) terlebih dahulu.");
        }

        // EKSEKUSI PENGIRIMAN!
        order.setStatus(OrderStatus.SHIPPED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder, savedOrder.getOrderItems());
    }

    // Fungsi Helper untuk merapikan JSON Balasan
    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream().map(item ->
                OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerName(order.getUser().getName())
                .shippingAddress(order.getShippingAddress())
                .subTotal(order.getSubTotal())
                .discount(order.getDiscount())
                .grandTotal(order.getGrandTotal())
                .status(order.getStatus().name())
                .orderDate(order.getOrderDate())
                .voucherCodeUsed(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .items(itemResponses)
                .build();
    }
}