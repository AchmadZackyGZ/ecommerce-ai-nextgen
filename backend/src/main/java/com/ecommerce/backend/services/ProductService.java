package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.dtos.ProductVariantResponse;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.ProductVariant;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ReviewRepository;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy;

import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    @Lazy // Untuk menghindari circular dependency dengan CloudinaryService
    private CloudinaryService cloudinaryService;

    // 🔥 FIX: Kita instansiasi langsung agar Spring tidak bingung mencari Bean!
    private final ObjectMapper objectMapper = new ObjectMapper();

    // membuat product baru (CREATE Product)
  @Transactional
    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> images, String variantsJson, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new ResourceNotFoundException("Toko tidak ditemukan!"));

        // 1. Upload Gambar
        List<String> uploadedImageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    uploadedImageUrls.add(cloudinaryService.uploadImage(img));
                }
            }
        }

        // 2. Build Produk
        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrls(uploadedImageUrls)
                .shop(shop)
                .variants(new ArrayList<>())
                .build();

        // 3. Parsing Varian (Gunakan variantsJson agar sinkron dengan Controller)
        parseVariants(product, variantsJson, request.getStock());

       // ✅ PANGGIL REPOSITORY UNTUK SAVE
        return mapToResponse(productRepository.save(product));
    }

    // mengambil semua product (READ Product)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToResponse) 
                .collect(Collectors.toList());
    }

    // mengambil product berdasarkan id
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));
        return mapToResponse(product);
    }

   @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> newImages, String variantsJson) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan"));

        // Update Data Dasar
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        // Update Gambar (Jika ada gambar baru, tambahkan ke list)
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile file : newImages) {
                if (!file.isEmpty()) {
                    product.getImageUrls().add(cloudinaryService.uploadImage(file));
                }
            }
        }

        // Reset dan Update Varian
        product.getVariants().clear();
        parseVariants(product, variantsJson, request.getStock());

        // ✅ PANGGIL REPOSITORY UNTUK SAVE
        return mapToResponse(productRepository.save(product));
    }


    // menghapus product berdasarkan id
    public String deleteProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));
        
        // Simpan nama produk sebelum dihapus
        String deletedProductName = existingProduct.getName();
        
        // Eksekusi hapus
        productRepository.delete(existingProduct);
        
        // Kembalikan nama produk untuk pesan notifikasi
        return deletedProductName;
    }

    // Helper untuk menghindari duplikasi kode parsing varian
    private void parseVariants(Product product, String variantsJson, Integer defaultStock) {
        try {
            if (variantsJson != null && !variantsJson.isEmpty()) {
                List<Map<String, Object>> variantData = objectMapper.readValue(variantsJson, new TypeReference<>() {});
                for (Map<String, Object> v : variantData) {
                    ProductVariant variant = ProductVariant.builder()
                            .variantName((String) v.get("name"))
                            .priceModifier(new BigDecimal(v.get("priceModifier").toString()))
                            .stock(Integer.parseInt(v.get("stock").toString()))
                            .product(product)
                            .build();
                    product.getVariants().add(variant);
                }
            } else {
                product.getVariants().add(ProductVariant.builder()
                        .variantName("Original")
                        .priceModifier(BigDecimal.ZERO)
                        .stock(defaultStock)
                        .product(product)
                        .build());
            }
        } catch (Exception e) {
            throw new BadRequestException("Gagal memproses varian: " + e.getMessage());
        }
    }

    //  HELPER V1: MENGUBAH ENTITY MENJADI RESPONSE BESERTA VARIAN-NYA!
    private ProductResponse mapToResponse(Product product) {

        Shop shop = product.getShop();

        // LOGIKA DINAMIS 1: Hitung Rata-Rata Rating Toko dari Database
        Double averageRating = reviewRepository.getAverageRatingByShopId(product.getShop().getId());
        
        // LOGIKA DINAMIS 2: Hitung Total Produk Toko saat ini
        int totalProducts = productRepository.countByShop(product.getShop());

        // LOGIKA DINAMIS 3: Kalkulator Waktu Bergabung (Join Date)
        String joinDateStr = "Baru Bergabung";
        if (product.getShop().getCreatedAt() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(product.getShop().getCreatedAt(), java.time.LocalDateTime.now());
            if (days == 0) joinDateStr = "Hari ini";
            else if (days < 30) joinDateStr = days + " Hari Lalu";
            else if (days < 365) joinDateStr = (days / 30) + " Bulan Lalu";
            else joinDateStr = (days / 365) + " Tahun Lalu";
        }

        // LOGIKA DINAMIS 4: Kalkulator Status Online (Last Active)
        String lastActiveStr = "Offline";
        LocalDateTime lastActive = product.getShop().getOwner().getLastActive();

        if(lastActive != null) {
            long minutes = ChronoUnit.MINUTES.between(lastActive, LocalDateTime.now());
            if (minutes < 1) lastActiveStr = "Baru Saja Aktif";
            else if (minutes < 60) lastActiveStr = "Aktif " + minutes + " Menit Lalu";
            else if (minutes < 1440) lastActiveStr = "Aktif " + (minutes / 60) + " Jam Lalu";
            else lastActiveStr = "Aktif " + (minutes / 1440) + " Hari Lalu";
        } else {
            // Jika user baru daftar dan belum terekam lastActive-nya
            lastActiveStr = "Baru Saja Aktif";
        }

        // LOGIKA DINAMIS 5: Format Performa Chat
        Integer rate = product.getShop().getResponseRate();
        String responseRateStr = (rate != null ? rate : 100) + "%";

        // 🌟 LOGIKA DINAMIS 6: Mapping Varian
        List<ProductVariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .variantName(v.getVariantName())
                        .priceModifier(v.getPriceModifier())
                        .stock(v.getStock())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .description(product.getDescription())
                .imageUrls(product.getImageUrls())
                .shopId(shop.getId())
                .shopName(shop.getName())
                .shopOwnerId(shop.getOwner().getId())
                .shopAvatar(shop.getAvatarUrl())
                .shopRating(averageRating)
                .shopTotalProducts(totalProducts)
                .shopJoinDate(joinDateStr)
                .shopResponseRate(responseRateStr)
                .shopLastActive(lastActiveStr)
                .variants(variantResponses)
                .createdAt(product.getCreatedAt())
                .build();
    }
}