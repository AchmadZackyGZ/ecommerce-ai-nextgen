package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ShopRequest;
import com.ecommerce.backend.dtos.ShopResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    public ShopResponse createShop(ShopRequest request, String ownerEmail) {
        // 1. Cari data User (Seller) di database berdasarkan email dari token JWT
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        // 2. Cek Aturan: 1 Seller = 1 Toko
        if (shopRepository.findByOwner(owner).isPresent()) {
            throw new BadRequestException("Anda sudah memiliki toko! Satu akun hanya boleh membuka satu toko.");
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
                .build();

        // 5. Simpan ke Database
        Shop savedShop = shopRepository.save(shop);

        // 6. Kembalikan data toko ke Frontend
        return ShopResponse.builder()
                .id(savedShop.getId())
                .name(savedShop.getName())
                .description(savedShop.getDescription())
                .ownerName(owner.getName())
                .createdAt(savedShop.getCreatedAt())
                .build();
    }
}