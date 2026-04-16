package com.ecommerce.backend.services;

import com.ecommerce.backend.config.GetStreamConfig;
import com.ecommerce.backend.dtos.AuthRequest;
import com.ecommerce.backend.dtos.AuthResponse;
import com.ecommerce.backend.exceptions.BadRequestException;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.models.UserDevice;
import com.ecommerce.backend.repositories.UserDeviceRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;


@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;  

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Autowired
    GetStreamConfig getStreamConfig;


    public AuthResponse login(AuthRequest request, String ipAddress, String userAgent) {
        try {
            //  Suruh Satpam mengecek kecocokan email dan password
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            // Jika salah password / email tidak ada
            throw new BadRequestException("Email atau Password salah!");
        }

        //  Jika lolos, ambil data user
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User tidak ditemukan"));

        // CATAT PERANGKAT YANG BARU SAJA LOGIN KE DATABASE!
        UserDevice userDevice = UserDevice.builder()
                .user(user)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .isActive(true) // meskipun saya tidak memanggil .isActive(), tapi karena di models UserDevice sudah saya set default = true, maka nilai isActive otomatis akan true saat dibuat baru di database
                .build();
        userDeviceRepository.save(userDevice);

        //  Cetak tiket JWT
        String jwtToken = jwtService.generateToken(user);

        //   CETAK TIKET GETSTREAM (Untuk akses fitur Chat)
        // GetStream hanya butuh payload "user_id" (dalam bentuk String) yang di-Tanda Tangani oleh Secret API
        String streamToken = io.jsonwebtoken.Jwts.builder()
                .claim("user_id", String.valueOf(user.getId())) // Gunakan ID User Nexia sebagai ID GetStream
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(getStreamConfig.getSecret().getBytes(StandardCharsets.UTF_8)), io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
        
        //  Berikan balasan ke Frontend berupa tiket JWT, tiket GetStream, nama user, dan role user
        return AuthResponse.builder()
                .token(jwtToken)
                .streamToken(streamToken)
                .role(user.getRole().name())
                .name(user.getName())
                .build();
    }
}