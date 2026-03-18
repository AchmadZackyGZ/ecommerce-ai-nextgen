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
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private ProductVariantRepository productVariantRepository;
    @Autowired private AddressRepository addressRepository;

    // Artinya: Jika di tengah jalan gagal (misal stok habis), semua perubahan ditarik mundur (Rollback)!
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
                    // Harga dinamis: Harga Dasar Produk + Harga Tambahan Varian
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

       Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress) // Simpan Entitas Address
                .subTotal(subTotal)
                .discount(discount)
                .grandTotal(grandTotal)
                .status(OrderStatus.PENDING)
                .orderDate(LocalDateTime.now())
                .voucher(validVoucher)
                .build();
        Order savedOrder = orderRepository.save(order);

       List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            ProductVariant variant = cartItem.getVariant();
            if (variant.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Gagal Checkout! Stok produk '" + variant.getProduct().getName() + "' tidak mencukupi.");
            }
            // 🔥 Potong stok dari Varian
            variant.setStock(variant.getStock() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal finalPrice = variant.getProduct().getPrice().add(variant.getPriceModifier());
            return OrderItem.builder()
                    .order(savedOrder)
                    .variant(variant) //  Simpan Varian di OrderItem
                    .quantity(cartItem.getQuantity())
                    .price(finalPrice)
                    .build();
        }).collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);
        cartItemRepository.deleteAll(cartItems);
        cart.getCartItems().clear();

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
                .anyMatch(item -> item.getVariant().getProduct().getShop().getId().equals(shop.getId()));

        if (!isOwner) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa memproses pesanan toko lain!");
        }

        // 🔥 VALIDASI LOGIKA: Hanya pesanan yang sudah dibayar (PAID) yang boleh dikirim!
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Gagal dikirim! Pesanan ini berstatus " + order.getStatus().name() + ". Hanya pesanan PAID yang bisa diselesaikan.");
        }

        // EKSEKUSI PENGIRIMAN!
        order.setStatus(OrderStatus.SHIPPED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder, savedOrder.getOrderItems());
    }

    // --- 5. FITUR CUSTOMER: KONFIRMASI PESANAN DITERIMA (COMPLETED) ---
    @Transactional
    public OrderResponse completeOrder(Long orderId, String userEmail) {
        // 1. Cari user yang sedang login (Customer)
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // 2. Cari Struk Pesanannya
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Pesanan tidak ditemukan!"));

        // 3. 🔥 VALIDASI KEAMANAN: Pastikan pesanan ini benar-benar milik Customer tersebut!
        if (!order.getUser().getId().equals(customer.getId())) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa menyelesaikan pesanan milik orang lain!");
        }

        // 4. 🔥 VALIDASI LOGIKA: Hanya pesanan yang sedang dikirim (SHIPPED) yang bisa diselesaikan!
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new BadRequestException("Gagal! Pesanan ini berstatus " + order.getStatus().name() + ". Hanya pesanan SHIPPED yang bisa diselesaikan.");
        }

        // 5. EKSEKUSI PENYELESAIAN!
        order.setStatus(OrderStatus.COMPLETED);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponse(savedOrder, savedOrder.getOrderItems());
    }

   // 🔥 PERBAIKAN Helper Method
    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream().map(item ->
                OrderItemResponse.builder()
                        .productId(item.getVariant().getProduct().getId()) // 🔥 Ambil dari Varian
                        .productName(item.getVariant().getProduct().getName() + " (" + item.getVariant().getVariantName() + ")")
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .customerName(order.getUser().getName())
                .shippingAddress(order.getShippingAddress().getFullAddress()) // 🔥 Ekstrak String dari Entitas Address
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