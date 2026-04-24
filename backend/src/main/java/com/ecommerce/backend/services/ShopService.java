package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.dtos.ShopProfileResponse;
import com.ecommerce.backend.dtos.ShopRequest;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.dtos.VoucherResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ReviewRepository;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;
import com.ecommerce.backend.repositories.VoucherRepository;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired 
    private VoucherRepository voucherRepository;

    @Autowired 
    private ReviewRepository reviewRepository;

    // fitur untuk seller membuka toko baru 
    public ShopResponse createShop(ShopRequest request, String ownerEmail, MultipartFile image) {
        // 1. Cari data User (Seller) di database berdasarkan email dari token JWT
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // 2. Cek Aturan: 1 Seller = 1 Toko
        if (shopRepository.findByOwner(owner).isPresent()) {
            throw new BadRequestException("Anda sudah memiliki toko!");
        }

        // 3. Cek Aturan: Nama toko harus unik
        if (shopRepository.existsByName(request.getName())) {
            throw new BadRequestException("Nama toko sudah digunakan, silakan pilih nama lain.");
        }

       // 🔥 LOGIKA AVATAR TOKO (CLOUDINARY vs DICEBEAR AI)
        String finalAvatarUrl;
        if (image != null && !image.isEmpty()) {
            // Jika Seller rajin dan upload foto, kirim ke Cloudinary
            finalAvatarUrl = cloudinaryService.uploadImage(image);
        } else {
            // Jika Seller malas, kita generate Avatar AI super keren berbasis nama toko mereka!
            // Kita hilangkan spasinya agar URL Dicebear tidak error
            String seedName = request.getName().replaceAll("\\s+", ""); 
            finalAvatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=" + seedName;
        }

        // 4. Bangun Tokonya
        Shop shop = Shop.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .avatarUrl(finalAvatarUrl) // Set URL avatar yang sudah kita tentukan di atas
                .status(ShopStatus.PENDING) // Set status awal ke PENDING, menunggu persetujuan admin
                .build();

        // 5. Simpan ke database dan kembalikan responsenya kita buat dibawah nanti mapToREsponse nyaa yaa
        Shop savedShop = shopRepository.save(shop);
        return mapToResponse(savedShop);
    }

    //  (UNTUK HALAMAN KUNJUNGI TOKO) ---
    public ShopProfileResponse getShopProfile(Long shopId, String currentUserEmail) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Toko tidak ditemukan!"));

        // 1. Hitung Statistik
        int totalProducts = productRepository.countByShop(shop);
        
        Double rawRating = reviewRepository.getAverageRatingByShopId(shop.getId());
        Double averageRating = Math.round(rawRating * 10.0) / 10.0; // Bulatkan ke 1 desimal

        // Hitung Join Date
        String joinDateStr = "Baru Bergabung";
        if (shop.getCreatedAt() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(shop.getCreatedAt(), java.time.LocalDateTime.now());
            if (days == 0) joinDateStr = "Hari ini";
            else if (days < 30) joinDateStr = days + " Hari Lalu";
            else if (days < 365) joinDateStr = (days / 30) + " Bulan Lalu";
            else joinDateStr = (days / 365) + " Tahun Lalu";
        }

        // Hitung Last Active Penjual
        String lastActiveStr = "Offline";
        java.time.LocalDateTime lastActive = shop.getOwner().getLastActive();
        if (lastActive != null) {
            long minutes = java.time.temporal.ChronoUnit.MINUTES.between(lastActive, java.time.LocalDateTime.now());
            if (minutes < 1) lastActiveStr = "Baru Saja Aktif";
            else if (minutes < 60) lastActiveStr = "Aktif " + minutes + " Menit Lalu";
            else if (minutes < 1440) lastActiveStr = "Aktif " + (minutes / 60) + " Jam Lalu";
            else lastActiveStr = "Aktif " + (minutes / 1440) + " Hari Lalu";
        }

        // Cek apakah User yang sedang login sudah mengikuti toko ini atau belum
        boolean isFollowing = false;
        if (currentUserEmail != null) {
            User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
            if (currentUser != null) {
                isFollowing = shop.getFollowers().contains(currentUser);
            }
        }

        // 2. Tarik Data Voucher Aktif Milik Toko Ini
        List<VoucherResponse> shopVouchers = voucherRepository.findByShop(shop).stream()
                .filter(v -> v.getExpiredAt().isAfter(java.time.LocalDateTime.now()) && v.getQuota() > 0)
                .map(v -> VoucherResponse.builder()
                        .id(v.getId())
                        .code(v.getCode())
                        .discountPercentage(v.getDiscountPercentage())
                        .maxDiscountAmount(v.getMaxDiscountAmount())
                        .quota(v.getQuota())
                        .expiredAt(v.getExpiredAt())
                        .build())
                .collect(Collectors.toList());

        // 3. Tarik 5 Produk Paling Laris (Produk Unggulan)
        List<ProductResponse> featuredProducts = productRepository.findTop5ByShopOrderBySoldCountDesc(shop).stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .price(p.getPrice())
                        .imageUrls(p.getImageUrls())
                        .category(p.getCategory())
                        .stock(p.getStock())
                        .build())
                .collect(Collectors.toList());

        // 4. Rakit dan Kirim!
        return ShopProfileResponse.builder()
                .id(shop.getId())
                .name(shop.getName())
                .description(shop.getDescription())
                .avatarUrl(shop.getAvatarUrl())
                .imageBannerUrl(shop.getImageBannerUrl())
                .videoBannerUrl(shop.getVideoBannerUrl())
                .responseRate(shop.getResponseRate())
                .averageRating(averageRating)
                .totalProducts(totalProducts)
                .joinDate(joinDateStr)
                .lastActive(lastActiveStr)
                .activeVouchers(shopVouchers)
                .featuredProducts(featuredProducts)
                .followerCount(shop.getFollowerCount()) // Ambil dari DB
                .isFollowing(isFollowing) // Beritahu React status tombolnya
                .build();
    }

    @Transactional
    public boolean toggleFollowShop(Long shopId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new com.ecommerce.backend.exceptions.ResourceNotFoundException("User tidak ditemukan!"));
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new com.ecommerce.backend.exceptions.ResourceNotFoundException("Toko tidak ditemukan!"));

        boolean isFollowing = shop.getFollowers().contains(user);

        if (isFollowing) {
            shop.getFollowers().remove(user);
            shop.setFollowerCount(Math.max(0, shop.getFollowerCount() - 1));
        } else {
            shop.getFollowers().add(user);
            shop.setFollowerCount(shop.getFollowerCount() + 1);
        }

        shopRepository.save(shop);
        return !isFollowing; // Return true jika sekarang jadi mengikuti
    }

    // Fitur khusus Admin: Melihat daftar toko yang masih pending untuk disetujui atau ditolak

    // admin melihat daftar toko yang masih pending
    public List<ShopResponse> getPendingShops() {
        List<Shop> pendingShops = shopRepository.findByStatus(ShopStatus.PENDING);
        return pendingShops.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin menyetujui atau menolak toko
    public ShopResponse updateShopStatus(Long shopId, ShopStatus newStatus) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Toko dengan ID tersebut tidak ditemukan!"));
        
        // 🔥 VALIDASI BARU: Cek apakah status toko sudah sama dengan yang di-request
        if (shop.getStatus() == newStatus) {
            throw new BadRequestException("Gagal: Toko ini sudah berstatus " + newStatus.name() + " sebelumnya!");
        }

        shop.setStatus(newStatus);
        Shop savedShop = shopRepository.save(shop);
        
        return mapToResponse(savedShop);
    }

    // fungsi kembalikan data response yang akan dikirim ke client
    private ShopResponse mapToResponse(Shop shop) {
        return ShopResponse.builder() 
                .id(shop.getId())
                .name(shop.getName())
                .description(shop.getDescription())
                .ownerName(shop.getOwner().getName())
                .status(shop.getStatus().name()) // Kembalikan statusnya ke Frontend
                .avatarUrl(shop.getAvatarUrl())
                .createdAt(shop.getCreatedAt())
                .build();
    }
}