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

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // fitur untuk seller membuka toko baru 
    public ShopResponse createShop(ShopRequest request, String ownerEmail) {
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

        // 4. Bangun Tokonya
        Shop shop = Shop.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
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
                .createdAt(shop.getCreatedAt())
                .build();
    }
}