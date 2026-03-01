package com.ecommerce.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    // Memanggil Bean Cloudinary yang sudah kita rakit di CloudinaryConfig tadi
    @Autowired
    private Cloudinary cloudinary;

    // 🔥 FUNGSI SAKTI: Upload gambar dan kembalikan URL-nya
    @SuppressWarnings("unchecked") // biar ga rewel soal Map yang kita dapat dari Cloudinary
    public String uploadImage(MultipartFile file) {
        try {
            // Kita suruh Cloudinary merapikan file-nya ke dalam folder "nexia_reviews"
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "nexia_reviews"
            ));
            
            // Cloudinary akan mengembalikan banyak data JSON, kita hanya ambil "url"-nya saja
            return uploadResult.get("url").toString();
            
        } catch (IOException e) {
            throw new RuntimeException("Gagal mengupload gambar ke Cloudinary: " + e.getMessage());
        }
    }
}