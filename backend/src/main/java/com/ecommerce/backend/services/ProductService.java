package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.dtos.ProductVariantResponse;
import com.ecommerce.backend.models.Product;
import com.ecommerce.backend.models.ProductVariant;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopStatus;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.ProductRepository;
import com.ecommerce.backend.repositories.ProductVariantRepository;
import com.ecommerce.backend.repositories.ReviewRepository;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.transaction.Transactional;

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
    private CloudinaryService cloudinaryService;

    // 🔥 KUNCI V1: Kita butuh repository varian
    @Autowired
    private ProductVariantRepository productVariantRepository; 

    // membuat product baru (CREATE Product)
   @Transactional 
    public ProductResponse createProduct(ProductRequest request, MultipartFile image, String variantsJson, String sellerEmail) {

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!")); 

        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko! Silakan buka toko terlebih dahulu."));

        if (shop.getStatus() != ShopStatus.APPROVED) {
            throw new BadRequestException("Akses Ditolak: Toko Anda masih berstatus " + shop.getStatus() + ". Tunggu persetujuan Admin untuk mulai berjualan.");
        }

        // 🚀 PROSES UPLOAD GAMBAR KE CLOUDINARY
        String uploadedImageUrl = null;
        if (image != null && !image.isEmpty()) {
            uploadedImageUrl = cloudinaryService.uploadImage(image);
        }

        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory()) //  Jangan lupa set kategori dari request ke entity!
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(uploadedImageUrl)
                .shop(shop) 
                .build();

        Product savedProduct = productRepository.save(product); 

        // 🔥 LOGIKA V1 MUTAKHIR: MEMBACA JSON VARIAN DARI POSTMAN!
        List<ProductVariant> savedVariants = new ArrayList<>();

        if (variantsJson != null && !variantsJson.isEmpty()) {
            try {
                // Mesin Penerjemah JSON ke Java
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> variantList = mapper.readValue(variantsJson, new TypeReference<List<Map<String, Object>>>() {});
                
                // Looping dan buat Varian satu per satu
                for (Map<String, Object> varData : variantList) {
                    ProductVariant variant = ProductVariant.builder()
                            .product(savedProduct)
                            .variantName(varData.get("name").toString())
                            .priceModifier(new BigDecimal(varData.get("priceModifier").toString()))
                            .stock(Integer.parseInt(varData.get("stock").toString()))
                            .build();
                    savedVariants.add(productVariantRepository.save(variant));
                }
            } catch (Exception e) {
                throw new BadRequestException("Format varian salah! Pastikan menggunakan JSON Array yang benar di Postman.");
            }
        } else {
            // 🛡️ FALLBACK: Jika di Postman lupa diisi variannya, kita buatkan "Original"
            ProductVariant defaultVariant = ProductVariant.builder()
                    .product(savedProduct)
                    .variantName("Original")
                    .priceModifier(BigDecimal.ZERO)
                    .stock(request.getStock())
                    .build();
            savedVariants.add(productVariantRepository.save(defaultVariant));
        }

        savedProduct.setVariants(savedVariants);

        return mapToResponse(savedProduct);
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

    // mengupdate product berdasarkan id
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));

        existingProduct.setName(request.getName());
        existingProduct.setCategory(request.getCategory()); // Jangan lupa update kategori juga!
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());
        existingProduct.setImageUrl(request.getImageUrl());

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToResponse(updatedProduct);
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

    //  HELPER V1: MENGUBAH ENTITY MENJADI RESPONSE BESERTA VARIAN-NYA!
    private ProductResponse mapToResponse(Product product) {
        
        // Bongkar daftar varian dari database, masukkan ke dalam kardus DTO
        List<ProductVariantResponse> variantResponses = new ArrayList<>();
        if (product.getVariants() != null) {
            variantResponses = product.getVariants().stream().map(variant -> 
                ProductVariantResponse.builder()
                    .id(variant.getId())
                    .variantName(variant.getVariantName())
                    .priceModifier(variant.getPriceModifier())
                    .stock(variant.getStock())
                    .build()
            ).collect(Collectors.toList());
        }

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

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory()) //  Jangan lupa sertakan kategori di response juga!
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .shopId(product.getShop().getId())
                .shopName(product.getShop().getName())
                .shopOwnerId(product.getShop().getOwner().getId())
                .shopAvatar(product.getShop().getAvatarUrl()) // Ambil avatar toko dari database
                .shopRating(averageRating) 
                .shopTotalProducts(totalProducts) 
                .shopJoinDate(joinDateStr)
                .shopResponseRate(responseRateStr)
                .shopLastActive(lastActiveStr)
                .variants(variantResponses) //  KITA SELIPKAN DATA VARIAN DI SINI!
                .createdAt(product.getCreatedAt())
                .build();
    }
}