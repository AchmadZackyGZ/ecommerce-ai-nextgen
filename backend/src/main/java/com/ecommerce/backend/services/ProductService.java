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
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.transaction.Transactional;

import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;

import java.math.BigDecimal;
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

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .shopId(product.getShop().getId())
                .shopName(product.getShop().getName())
                .shopAvatar(null) // Kirim null agar React otomatis membuatkan Avatar AI
                .shopRating(4.9) // Sementara kita set rating tinggi (Nanti bisa dihitung dari tabel Review)
                .shopTotalProducts(15) // Jumlah produk toko
                .shopJoinDate("2 Tahun Lalu") // Waktu bergabung
                .variants(variantResponses) //  KITA SELIPKAN DATA VARIAN DI SINI!
                .createdAt(product.getCreatedAt())
                .build();
    }
}