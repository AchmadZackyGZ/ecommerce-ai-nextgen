package com.ecommerce.backend.services;

import com.ecommerce.backend.config.MidtransConfig;
import com.ecommerce.backend.models.Order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class MidtransService {

    @Autowired
    private MidtransConfig midtransConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateSnapToken(Order order) {
        String apiUrl = midtransConfig.isProduction() ? 
                "https://app.midtrans.com/snap/v1/transactions" : 
                "https://app.sandbox.midtrans.com/snap/v1/transactions";

        // 1. Buat Header dengan Autentikasi Basic (Server Key + ":")
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String authString = midtransConfig.getServerKey() + ":";
        String base64Auth = Base64.getEncoder().encodeToString(authString.getBytes());
        headers.set("Authorization", "Basic " + base64Auth);

        // 2. Siapkan Payload (Data Transaksi)
        Map<String, Object> requestBody = new HashMap<>();

        // 2a. Detail Transaksi (ID & Harga)
        Map<String, Object> transactionDetails = new HashMap<>();
        transactionDetails.put("order_id", order.getInvoiceId());
        transactionDetails.put("gross_amount", order.getGrandTotal().longValue()); // Midtrans butuh angka bulat
        requestBody.put("transaction_details", transactionDetails);

        // 2b. Detail Pelanggan (Untuk dikirim ke email mereka)
        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("first_name", order.getUser().getName());
        customerDetails.put("email", order.getUser().getEmail());
        customerDetails.put("phone", order.getShippingAddress().getPhoneNumber());
        requestBody.put("customer_details", customerDetails);

        // 3. Tembak API Midtrans!
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Berhasil! Ambil Token-nya
                return response.getBody().get("token").toString();
            }
        } catch (Exception e) {
            System.err.println("Gagal generate Midtrans Token: " + e.getMessage());
        }

        return null;
    }
}