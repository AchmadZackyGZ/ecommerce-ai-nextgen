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
    @Transactional // Wajib pakai ini agar jika varian gagal dibuat, produk juga batal dibuat
    public ProductResponse createProduct(ProductRequest request, MultipartFile image ,String sellerEmail) {

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!")); 

        Shop shop = shopRepository.findByOwner(seller)
                .orElseThrow(() -> new BadRequestException("Anda belum memiliki toko! Silakan buka toko terlebih dahulu."));

        if (shop.getStatus() != ShopStatus.APPROVED) {
            throw new BadRequestException("Akses Ditolak: Toko Anda masih berstatus " + shop.getStatus() + ". Tunggu persetujuan Admin untuk mulai berjualan.");
        }

        // 🚀 PROSES UPLOAD GAMBAR KE CLOUDINARY (TETAP AMAN!)
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

        //  LOGIKA V1: OTOMATIS BUAT VARIAN "ORIGINAL" AGAR PRODUK BISA DIBELI!
        ProductVariant defaultVariant = ProductVariant.builder()
                .product(savedProduct)
                .variantName("Original") // Nama varian bawaan
                .priceModifier(BigDecimal.ZERO) // Tidak ada tambahan harga
                .stock(request.getStock()) // Stok mengikuti stok induk
                .build();
        productVariantRepository.save(defaultVariant);

        // Pasangkan varian ke produk untuk dikirim sebagai balasan
        savedProduct.setVariants(List.of(defaultVariant));

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
    public void deleteProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produk tidak ditemukan dengan ID: " + id));
        productRepository.delete(existingProduct);
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
                .variants(variantResponses) //  KITA SELIPKAN DATA VARIAN DI SINI!
                .createdAt(product.getCreatedAt())
                .build();
    }
}