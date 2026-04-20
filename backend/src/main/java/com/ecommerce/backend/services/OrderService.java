package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.OrderItemResponse;
import com.ecommerce.backend.dtos.OrderRequest;
import com.ecommerce.backend.dtos.OrderResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.*;
import com.ecommerce.backend.repositories.*;
import com.midtrans.httpclient.SnapApi; // 🔥 IMPORT CORE MIDTRANS
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.ecommerce.backend.events.OrderStatusEvent; // 🔥 IMPORT EVENT NOTIFIKASI

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private ProductVariantRepository productVariantRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private ApplicationEventPublisher eventPublisher; //  INI UNTUK MENERBITKAN EVENT NOTIFIKASI

    @Transactional
    public OrderResponse checkout(OrderRequest request, String userEmail) {
        
        // 1. Cari User dan Keranjangnya
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        Address shippingAddress = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Alamat pengiriman tidak ditemukan!"));
        
        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Keranjang belanja Anda masih kosong! Tidak bisa checkout.");
        }

        // 2. Hitung SubTotal Murni (Harga Asli Barang x Kuantitas)
        BigDecimal subTotal = cartItems.stream()
                .map(item -> {
                  BigDecimal finalPrice = item.getVariant().getProduct().getPrice().add(item.getVariant().getPriceModifier());
                    return finalPrice.multiply(new BigDecimal(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. LOGIKA VOUCHER 
        BigDecimal discount = BigDecimal.ZERO;
        Voucher validVoucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            validVoucher = voucherRepository.findByCode(request.getVoucherCode().toUpperCase())
                    .orElseThrow(() -> new BadRequestException("Kode voucher tidak valid!"));

            if (validVoucher.getExpiredAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Voucher sudah kadaluarsa!");
            }
            if (validVoucher.getQuota() <= 0) {
                throw new BadRequestException("Kuota voucher sudah habis!");
            }

            BigDecimal percentageDecimal = new BigDecimal(validVoucher.getDiscountPercentage());
            BigDecimal calculatedDiscount = subTotal.multiply(percentageDecimal)
                    .divide(new BigDecimal(100), RoundingMode.HALF_UP);

            if (calculatedDiscount.compareTo(validVoucher.getMaxDiscountAmount()) > 0) {
                discount = validVoucher.getMaxDiscountAmount();
            } else {
                discount = calculatedDiscount;
            }

            validVoucher.setQuota(validVoucher.getQuota() - 1);
            voucherRepository.save(validVoucher);
        }

       // 🔥 FIX FATAL: TAMBAHKAN ONGKOS KIRIM & BIAYA PROTEKSI SEBELUM MASUK MIDTRANS!
       // NANTI BISA MENGGUNAKAN RAJA ONGKIR API UNTUK MENGHITUNG ONGKIR DYNAMIC BERDASARKAN ALAMAT & BERAT PRODUK
        BigDecimal shippingCost = BigDecimal.ZERO;
        if ("kargo".equalsIgnoreCase(request.getShippingMethod())) {
            shippingCost = new BigDecimal("35000");
        } else {
            shippingCost = new BigDecimal("15000"); // reguler
        }
        BigDecimal protectionFee = new BigDecimal("1000");

        // 4. Hitung Grand Total (Subtotal - Diskon + Ongkir + Proteksi)
        BigDecimal grandTotal = subTotal.subtract(discount).add(shippingCost).add(protectionFee);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

       // 🔥 5. BUAT DRAF PESANAN (Menambahkan data metode pembayaran & pengiriman dari Frontend)
       Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress) 
                .subTotal(subTotal)
                .discount(discount)
                .grandTotal(grandTotal)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .voucher(validVoucher)
                .shippingMethod(request.getShippingMethod()) 
                .paymentMethod(request.getPaymentMethod())   
                .paymentBank(request.getPaymentBank())       
                .sellerNote(request.getSellerNote())         
                .build();
        Order savedOrder = orderRepository.save(order);

       List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            ProductVariant variant = cartItem.getVariant();
            if (variant.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Gagal Checkout! Stok produk '" + variant.getProduct().getName() + "' tidak mencukupi.");
            }
            variant.setStock(variant.getStock() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal finalPrice = variant.getProduct().getPrice().add(variant.getPriceModifier());
            return OrderItem.builder()
                    .order(savedOrder)
                    .variant(variant) 
                    .quantity(cartItem.getQuantity())
                    .price(finalPrice)
                    .build();
        }).collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);
        cartItemRepository.deleteAll(cartItems);
        cart.getCartItems().clear();

        // 🚀 6. THE MAGIC MOMENT: PANGGIL MIDTRANS JIKA BUKAN COD! 🚀
        if (request.getPaymentMethod() != null && request.getPaymentMethod().equalsIgnoreCase("bank_transfer")) {
            try {
                // Siapkan Map/JSON untuk dikirim ke Midtrans
                Map<String, Object> params = new HashMap<>();

                // Detail Transaksi
                Map<String, String> transactionDetails = new HashMap<>();
                transactionDetails.put("order_id", "NEXIA-" + savedOrder.getId());
                transactionDetails.put("gross_amount", savedOrder.getGrandTotal().longValue() + "");

                // Detail Customer
                Map<String, String> customerDetails = new HashMap<>();
                customerDetails.put("first_name", user.getName());
                customerDetails.put("email", user.getEmail());
                customerDetails.put("phone", shippingAddress.getPhoneNumber());

                params.put("transaction_details", transactionDetails);
                params.put("customer_details", customerDetails);

                // Tembak API Midtrans untuk mendapatkan Snap Token!
                String snapToken = SnapApi.createTransactionToken(params);
                
                // Simpan token ke database
                savedOrder.setSnapToken(snapToken);
                orderRepository.save(savedOrder);
                
            } catch (Exception e) {
                throw new RuntimeException("Gagal menghubungi Payment Gateway: " + e.getMessage());
            }
        }

        String productImageUrl = null;

       if(!orderItems.isEmpty()) { 
           productImageUrl = orderItems.get(0).getVariant().getProduct().getImageUrl();
        }

        //  NOTIFIKASI KE BACKGROUND!
        eventPublisher.publishEvent(new OrderStatusEvent(
                order.getUser(),
                "Pesanan Berhasil Dibuat",
                "Pesanan Anda (ID: " + order.getId() + ") telah diterima dan sedang menunggu pembayaran.",
                productImageUrl
        ));

        return mapToOrderResponse(savedOrder, orderItems);
    }

    // --- 2. FITUR MELIHAT RIWAYAT PESANAN (ORDER HISTORY) ---
    public List<OrderResponse> getUserOrderHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        List<Order> orders = orderRepository.findByUser(user);

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

        boolean isOwner = order.getOrderItems().stream()
                .anyMatch(item -> item.getVariant().getProduct().getShop().getId().equals(shop.getId()));

        if (!isOwner) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa memproses pesanan toko lain!");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Gagal dikirim! Pesanan ini berstatus " + order.getStatus().name() + ". Hanya pesanan PAID yang bisa diselesaikan.");
        }

        order.setStatus(OrderStatus.SHIPPED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder, savedOrder.getOrderItems());
    }

    // --- 5. FITUR CUSTOMER: KONFIRMASI PESANAN DITERIMA (COMPLETED) ---
    @Transactional
    public OrderResponse completeOrder(Long orderId, String userEmail) {
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan!"));

        if (!order.getUser().getId().equals(customer.getId())) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa menyelesaikan pesanan milik orang lain!");
        }

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new BadRequestException("Gagal! Pesanan ini berstatus " + order.getStatus().name() + ". Hanya pesanan SHIPPED yang bisa diselesaikan.");
        }

        order.setStatus(OrderStatus.COMPLETED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder, savedOrder.getOrderItems());
    }

   // 🔥 PERBAIKAN Helper Method (Menambahkan Snap Token ke Response)
    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream().map(item ->
                OrderItemResponse.builder()
                        .productId(item.getVariant().getProduct().getId()) 
                        .productName(item.getVariant().getProduct().getName() + " (" + item.getVariant().getVariantName() + ")")
                        .imageUrl(item.getVariant().getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerName(order.getUser().getName())
                .shippingAddress(order.getShippingAddress().getFullAddress()) 
                .subTotal(order.getSubTotal())
                .discount(order.getDiscount())
                .grandTotal(order.getGrandTotal())
                .status(order.getStatus().name())
                .orderDate(order.getOrderDate())
                .voucherCodeUsed(order.getVoucher() != null ? order.getVoucher().getCode() : null)
                .paymentMethod(order.getPaymentMethod()) // BARU
                .paymentBank(order.getPaymentBank()) // BARU
                .snapToken(order.getSnapToken()) // 🔥 TOKEN INI YANG DITUNGGU REACT!
                .items(itemResponses)
                .build();
    }
}