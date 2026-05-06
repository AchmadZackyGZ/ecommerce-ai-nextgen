package com.ecommerce.backend.controllers;

import com.ecommerce.backend.dtos.ApiResponse;
import com.ecommerce.backend.services.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasRole('SELLER')") // Khusus Penjual
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping("/shop")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShopFinance(Principal principal) {
        Map<String, Object> financeData = financeService.getShopFinance(principal.getName());

        ApiResponse<Map<String, Object>> response = ApiResponse.<Map<String, Object>>builder()
                .status(200)
                .message("Berhasil memuat data keuangan toko.")
                .data(financeData)
                .build();

        return ResponseEntity.ok(response);
    }
}