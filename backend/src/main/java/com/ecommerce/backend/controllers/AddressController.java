package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.AddressRequest;
import com.ecommerce.backend.dtos.AddressResponse;
import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.services.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    // POST: /api/addresses (Tambah Alamat)
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @RequestBody AddressRequest request, 
            Principal principal) { // Principal otomatis mengambil email dari Token JWT yang sedang login
        
        AddressResponse responseData = addressService.addAddress(request, principal.getName());
        
        ApiResponse<AddressResponse> response = ApiResponse.<AddressResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Alamat berhasil ditambahkan!")
                .data(responseData)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET: /api/addresses (Lihat Buku Alamat)
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getUserAddresses(Principal principal) {
        List<AddressResponse> addresses = addressService.getUserAddresses(principal.getName());
        
        ApiResponse<List<AddressResponse>> response = ApiResponse.<List<AddressResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil mengambil buku alamat")
                .data(addresses)
                .build();
        return ResponseEntity.ok(response);
    }

    // DELETE: /api/addresses/{id} (Hapus Alamat)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @PathVariable Long id, 
            Principal principal) {
        
        addressService.deleteAddress(id, principal.getName());
        
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.OK.value())
                .message("Alamat berhasil dihapus!")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }
}