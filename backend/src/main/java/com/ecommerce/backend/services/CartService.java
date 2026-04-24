package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.CartItemRequest;
import com.ecommerce.backend.dtos.CartItemResponse;
import com.ecommerce.backend.dtos.CartResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Cart;
import com.ecommerce.backend.models.CartItem;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.ProductVariant;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.CartItemRepository;
import com.ecommerce.backend.repositories.CartRepository;
import com.ecommerce.backend.repositories.ProductVariantRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    // --- 1. FITUR MENAMBAH BARANG KE KERANJANG ---
    public CartResponse addToCart(CartItemRequest request, String userEmail) {
        // 1. Cari Siapa yang lagi belanja
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // 2. Cari Keranjangnya
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Varian produk tidak ditemukan!"));
        Product product = variant.getProduct();

        //  Cegah Seller beli barangnya sendiri!
        if (product.getShop().getOwner().getId().equals(user.getId())) {
                throw new BadRequestException("Dilarang melakukan manipulasi! Anda tidak bisa memasukkan barang dari toko Anda sendiri ke keranjang.");
        }

        //  Cek ketersediaan Stok dari VARIAN, bukan Produk induk
        if (variant.getStock() < request.getQuantity()) {
                throw new BadRequestException("Stok tidak mencukupi! Sisa stok varian ini: " + variant.getStock());
        }

        // 5. Cek apakah barang ini sudah ada di keranjang sebelumnya?
        Optional<CartItem> existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst();

        if (existingCartItem.isPresent()) {
            // Jika SUDAH ADA, cukup tambahkan quantity-nya saja
            CartItem item = existingCartItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            
            // Cek stok lagi untuk total quantity baru
            if (variant.getStock() < newQuantity) {
                throw new BadRequestException("Stok tidak mencukupi untuk penambahan ini! Sisa stok: " + variant.getStock());
            }
            
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Jika BELUM ADA, buat CartItem baru
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem); // Simpan ke DB

            cart.getCartItems().add(newItem); // Tambahkan ke list di Cart
        }

        // 6. Kembalikan data keranjang yang sudah diupdate
        return getCart(userEmail);
    }

    // --- 2. FITUR MELIHAT ISI KERANJANG ---
    public CartResponse getCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        // Hitung harga dinamis untuk setiap item di keranjang, lalu konversi ke CartItemResponse
        List<CartItemResponse> itemResponses = cart.getCartItems().stream()
                .map(item -> {
                //  Hitung harga dinamis: Harga Dasar Produk + Harga Tambahan Varian
                    BigDecimal finalPrice = item.getVariant().getProduct().getPrice().add(item.getVariant().getPriceModifier());
                    return CartItemResponse.builder()
                        .id(item.getId())
                        .variantId(item.getVariant().getId())
                        .productName(item.getVariant().getProduct().getName() + " - " + item. getVariant().getVariantName()) // Nama Gabungan
                        .price(finalPrice)
                        .quantity(item.getQuantity())
                        .subTotal(finalPrice.multiply(new BigDecimal(item.getQuantity())))
                        .imageUrls(item.getVariant().getProduct().getImageUrls())
                        .build();
                }).collect(Collectors.toList());

       BigDecimal totalPrice = itemResponses.stream().map(CartItemResponse::getSubTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder().cartId(cart.getId()).items(itemResponses).totalPrice(totalPrice).build();
    }

    // --- 3. FITUR MENGUBAH JUMLAH BARANG DI KERANJANG ---
    public CartResponse updateCartItem(Long cartItemId, Integer newQuantity, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Barang di keranjang tidak ditemukan!"));

        // 🔥 VALIDASI KEAMANAN: Pastikan barang ini benar-benar ada di keranjang milik user yang sedang login!
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa mengubah keranjang milik orang lain!");
        }

        // Jika kuantitas diubah menjadi 0 atau kurang, sekalian saja hapus barangnya
        if (newQuantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            // Cek apakah stok toko masih cukup untuk jumlah yang baru
            if (cartItem.getVariant().getStock() < newQuantity) {
                throw new BadRequestException("Stok tidak mencukupi! Sisa stok: " + cartItem.getVariant().getStock());
            }
            // Update dan simpan
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        }

        // Kembalikan isi keranjang terbaru yang sudah dihitung ulang total harganya
        return getCart(userEmail);
    }

    // --- 4. FITUR MENGHAPUS BARANG DARI KERANJANG ---
    public String deleteCartItem(Long cartItemId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Keranjang tidak ditemukan!"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Barang di keranjang tidak ditemukan!"));

        // 🔥 VALIDASI KEAMANAN: Cegah hacker menghapus barang dari keranjang orang lain
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Akses Ditolak: Anda tidak bisa menghapus barang dari keranjang orang lain!");
        }

        // Simpan nama barang yang akan dihapus untuk dikembalikan sebagai pesan sukses
        String deletedProductName = cartItem.getVariant().getProduct().getName() + " - " + cartItem.getVariant().getVariantName();

        // Eksekusi Hapus!
        cartItemRepository.delete(cartItem);

        // Kembalikan isi keranjang terbaru
        return deletedProductName;
    }
}