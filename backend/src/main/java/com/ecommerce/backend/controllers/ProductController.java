package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.ProductRequest;
import com.ecommerce.backend.dtos.ProductResponse;
import com.ecommerce.backend.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 1. Endpoint POST (Membuat produk baru)
    // 🔥 HANYA SELLER YANG BOLEH MENAMBAH PRODUK ke Toko nya
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            //  UBAH 1: Ganti @RequestBody menjadi @ModelAttribute agar bisa menerima Teks di dalam Form-Data
            @ModelAttribute ProductRequest request,
            //  UBAH 2: Tambahkan Penangkap File Foto
            @RequestParam(value = "image", required = true) MultipartFile image,
            //  TANGKAP TEKS JSON VARIAN DARI POSTMAN DI SINI:
            @RequestParam(value = "variants", required = false) String variantsJson,
            Principal principal
        ) {

        // Ambil email dari token JWT
        String email = principal.getName();
        
        // Proses datanya di Service
        ProductResponse savedData = productService.createProduct(request, image, variantsJson ,email);
        
        // Bungkus dengan ApiResponse
        ApiResponse<ProductResponse> response = ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.CREATED.value()) // Angka 201
                .message("Berhasil menambahkan Produk ke Toko Anda")
                .data(savedData)
                .build();

        // Kirim menggunakan Kurir (ResponseEntity)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Endpoint GET (Mengambil semua produk)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> allData = productService.getAllProducts();
        
        ApiResponse<List<ProductResponse>> response = ApiResponse.<List<ProductResponse>>builder()
                .status(HttpStatus.OK.value()) // Angka 200
                .message("Berhasil mengambil semua data produk")
                .data(allData)
                .build();

        return ResponseEntity.ok(response);
    }

    // 3. Endpoint GET by ID (Mengambil produk berdasarkan ID)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse productData = productService.getProductById(id);
        
        ApiResponse<ProductResponse> response = ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil mengambil data produk dengan ID: " + id)
                .data(productData)
                .build();

        return ResponseEntity.ok(response);
    }

    // 4. Endpoint PUT (Mengupdate produk berdasarkan ID)
    // 🔥 HANYA SELLER DAN ADMIN YANG BOLEH UPDATE
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id,@RequestBody ProductRequest productRequest) {
        ProductResponse updateData = productService.updateProduct(id, productRequest);

        ApiResponse<ProductResponse> response = ApiResponse.<ProductResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil mengupdate data produk dengan ID: " + id)
                .data(updateData)
                .build();

        return ResponseEntity.ok(response);
    }

    // 5. Endpoint DELETE (Menghapus produk berdasarkan ID)
    // 🔥 HANYA ADMIN YANG BOLEH HAPUS karena 
    // Atau jika Seller juga boleh hapus: @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')") // Contoh: Seller juga boleh hapus produk mereka sendiri
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> deleteProduct(@PathVariable Long id) {
        
        // 1. Hapus produk dan tangkap nama barangnya dari Service
        String deletedProductName = productService.deleteProduct(id);
        
        // 2. Ambil daftar produk terbaru yang sudah bersih dari barang yang dihapus
        List<ProductResponse> remainingProducts = productService.getAllProducts();

        ApiResponse<List<ProductResponse>> response = ApiResponse.<List<ProductResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Produk '" + deletedProductName + "' berhasil dihilangkan dari katalog.")
                .data(remainingProducts) // 🔥 DATA TIDAK NULL LAGI! FRONTEND AKAN SANGAT BAHAGIA!
                .build();

        return ResponseEntity.ok(response);
    }
}