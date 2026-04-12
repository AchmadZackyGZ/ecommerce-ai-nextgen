package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.UserRequest;
import com.ecommerce.backend.dtos.UserResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserRole;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.backend.models.Cart;
import com.ecommerce.backend.repositories.CartRepository;
import com.ecommerce.backend.repositories.UserDeviceRepository;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service // Spring annotation to indicate that this class is a service component
public class UserService {
    
    @Autowired // Spring annotation to automatically inject the UserRepository dependency
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Injecting the PasswordEncoder to hash passwords before saving to the database

    @Autowired
    private CartRepository cartRepository; // Injecting CartRepository to create a cart for the user upon registration

    @Autowired
    private CloudinaryService cloudinaryService; // Injecting CloudinaryService to handle avatar uploads

    @Autowired
    private UserDeviceRepository userDeviceRepository; // Injecting UserDeviceRepository to log user devices on login

    // Method to create a new user based on the UserRequest DTO
  public UserResponse registerUser(UserRequest request) {
        // 1. Cek Email duplikat
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email " + request.getEmail() + " sudah terdaftar!");
        }

        // 2. VALIDASI ROLE (Mencegah pendaftaran Admin) 🔥
        UserRole roleToSave;
        try {
            roleToSave = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            // Jika user tidak isi role, atau isinya ngawur (misal "HACKER"), paksa jadi CUSTOMER
            roleToSave = UserRole.CUSTOMER;
        }

        // PERATURAN KERAS: Dilarang daftar jadi ADMIN lewat API ini!
        if (roleToSave == UserRole.ADMIN) {
            throw new BadRequestException("Anda tidak boleh mendaftar sebagai Admin!");
        }

        // 3. Simpan User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Enkripsi password sebelum disimpan
                .role(roleToSave) 
                .build();

        User savedUser = userRepository.save(user);

        // Buatkan keranjang kosong untuk user baru
        Cart cart = Cart.builder()
                .user(savedUser) // Tempelkan keranjang ini ke user yang baru saja dibuat
                .build();
        cartRepository.save(cart); // simpan keranjang ke database

        // 4. Kembalikan balasan yang rapi
        return mapToResponse(savedUser); 
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User dengan email " + email + " tidak ditemukan!"));
    }

    // Update profil (Nama, HP, dan Avatar)
    public User updateProfile(String email, String name, String phone, MultipartFile avatar) {
        User user = getCurrentUser(email);
        
        if (name != null && !name.isEmpty()) user.setName(name);
        if (phone != null && !phone.isEmpty()) user.setPhone(phone);
        
        // Logika Cloudinary untuk Foto Profil
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadImage(avatar);
            user.setAvatarUrl(avatarUrl);
        }
        
        return userRepository.save(user);
    }

    // fitur keamanan untuk ganti password
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getCurrentUser(email);

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Password lama yang Anda masukkan salah!");
        }

        if (oldPassword.equals(newPassword)) {
            throw new BadRequestException("Password baru tidak boleh sama dengan password lama!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    //  FITUR AMBIL DAFTAR PERANGKAT AKTIF
    public List<Map<String, Object>> getUserDevices(String email) {
        User user = getCurrentUser(email);
        
        return userDeviceRepository.findByUserAndIsActiveTrueOrderByLastLoginDesc(user).stream()
                .map(device -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", device.getId());
                    map.put("ipAddress", device.getIpAddress());
                    map.put("userAgent", device.getUserAgent());
                    map.put("lastLogin", device.getLastLogin());
                    return map;
                }).collect(Collectors.toList());
    }

    // Fungsi bantuan (Helper) untuk mengubah Entity User menjadi DTO UserResponse
    // (PENTING: Kita tidak memasukkan password ke dalam response!)
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name()) // Mengubah Enum UserRole menjadi String
                .createdAt(user.getCreatedAt())
                .build();
    }
}
