package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.VoucherRequest;
import com.ecommerce.backend.dtos.VoucherResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.Voucher;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;
import com.ecommerce.backend.repositories.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // --- 1. FITUR SELLER: MEMBUAT VOUCHER BARU ---
    public VoucherResponse createVoucher(VoucherRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko! Silakan buka toko terlebih dahulu."));

        // Validasi: Kode voucher harus unik (Kita paksa jadi huruf besar semua agar seragam)
        String voucherCode = request.getCode().toUpperCase();
        if (voucherRepository.findByCode(voucherCode).isPresent()) {
            throw new BadRequestException("Kode voucher '" + voucherCode + "' sudah pernah dibuat! Silakan gunakan kombinasi kode lain.");
        }

        // 🔥 VALIDASI BARU: SHOPEE STYLE!
        if (request.getDiscountPercentage() == null || request.getDiscountPercentage() <= 0 || request.getDiscountPercentage() > 100) {
            throw new BadRequestException("Gagal: Persentase diskon harus di antara 1 hingga 100!");
        }

        if (request.getMaxDiscountAmount() == null || request.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Gagal: Maksimal potongan harga (maxDiscountAmount) harus lebih besar dari 0!");
        }

        if (request.getQuota() <= 0) {
            throw new BadRequestException("Gagal: Kuota voucher harus lebih besar dari 0!");
        }

        // Voucher.builder() adalah fitur dari Lombok @Builder yang memudahkan kita membuat objek Voucher tanpa harus menulis constructor panjang lebar. Kita tinggal isi field yang mau diisi, dan builder akan mengurus sisanya.
        Voucher voucher = Voucher.builder()
                .code(voucherCode)
                .discountPercentage(request.getDiscountPercentage())   // 🔥 Simpan Persen
                .maxDiscountAmount(request.getMaxDiscountAmount())     // 🔥 Simpan Max Potongan
                .quota(request.getQuota())
                .expiredAt(request.getExpiredAt())
                .shop(shop)
                .build();

        Voucher savedVoucher = voucherRepository.save(voucher);

        return mapToResponse(savedVoucher);
    }

    // --- 2. FITUR SELLER: MELIHAT DAFTAR VOUCHER TOKONYA ---
    public List<VoucherResponse> getShopVouchers(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko!"));

        List<Voucher> vouchers = voucherRepository.findByShop(shop);

        return vouchers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Fungsi Helper
    private VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountPercentage(voucher.getDiscountPercentage())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .quota(voucher.getQuota())
                .expiredAt(voucher.getExpiredAt())
                .shopName(voucher.getShop().getName())
                .build();
    }
}