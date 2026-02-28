package com.ecommerce.backend.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // 🔥 Penting: Abaikan data Midtrans lain yang tidak kita butuhkan 
// DTO untuk menerima notifikasi dari Midtrans
public class MidtransNotificationRequest {

    @JsonProperty("order_id") // sesuaikan dengan field yang dikirim Midtrans
    private String orderId; // Ini akan berisi ID pesanan kita, misal "ORDER-12345"

    @JsonProperty("transaction_status") // sesuaikan dengan field yang dikirim Midtrans
    private String transactionStatus; // Contoh nilainya: "capture", "settlement", "pending", "deny", "expire", "cancel"

    @JsonProperty("fraud_status") // sesuaikan dengan field yang dikirim Midtrans
    private String fraudStatus; // Contoh nilainya: "accept", "challenge", "deny"
    
    @JsonProperty("gross_amount") // sesuaikan dengan field yang dikirim Midtrans
    private String grossAmount;   // Contoh nilainya: "100000.00" (string karena Midtrans mengirim angka sebagai string)
    
    @JsonProperty("payment_type") // sesuaikan dengan field yang dikirim Midtrans   
    private String paymentType; // Contoh nilainya: "credit_card", "bank_transfer", "gopay", dll.
}