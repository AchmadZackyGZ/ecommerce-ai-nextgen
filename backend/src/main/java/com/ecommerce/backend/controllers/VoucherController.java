package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.dtos.VoucherRequest;
import com.ecommerce.backend.dtos.VoucherResponse;
import com.ecommerce.backend.services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
// 🔥 GEMBOK SAKTI: HANYA SELLER YANG BOLEH AKSES CONTROLLER INI
@PreAuthorize("hasRole('SELLER')")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    // 1. API Membuat Voucher
    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(
            @RequestBody VoucherRequest request,
            Principal principal
    ) {
        VoucherResponse responseData = voucherService.createVoucher(request, principal.getName());

        ApiResponse<VoucherResponse> response = ApiResponse.<VoucherResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Voucher diskon berhasil diterbitkan.")
                .data(responseData)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. API Melihat Daftar Voucher
    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getShopVouchers(Principal principal) {
        List<VoucherResponse> responseData = voucherService.getShopVouchers(principal.getName());

        ApiResponse<List<VoucherResponse>> response = ApiResponse.<List<VoucherResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Berhasil memuat daftar voucher toko Anda.")
                .data(responseData)
                .build();

        return ResponseEntity.ok(response);
    }
}