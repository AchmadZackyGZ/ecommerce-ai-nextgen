package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ShopRequest;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;


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