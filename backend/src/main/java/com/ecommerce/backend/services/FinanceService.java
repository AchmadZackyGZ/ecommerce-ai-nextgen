package com.ecommerce.backend.services;

import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.EscrowStatus;
import com.ecommerce.backend.models.Order;
import com.ecommerce.backend.models.Shop;
import com.ecommerce.backend.models.ShopTransaction;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.OrderRepository;
import com.ecommerce.backend.repositories.ShopRepository;
import com.ecommerce.backend.repositories.ShopTransactionRepository;
import com.ecommerce.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    @Autowired private UserRepository userRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private ShopTransactionRepository shopTransactionRepository;
    @Autowired private OrderRepository orderRepository;

    public Map<String, Object> getShopFinance(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        Shop shop = shopRepository.findByOwner(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Toko tidak ditemukan"));

        // 1. Ambil Saldo Aktif yang bisa ditarik
        BigDecimal activeBalance = shop.getBalance();

        // 2. Hitung Saldo Tertahan (HELD di Escrow) dikurangi fee 1%
        List<Order> shopOrders = orderRepository.findOrdersByShop(shop);
        BigDecimal heldBalance = shopOrders.stream()
                .filter(o -> o.getEscrowStatus() == EscrowStatus.HELD)
                .map(o -> {
                    BigDecimal fee = o.getGrandTotal().multiply(new BigDecimal("0.01")).setScale(0, RoundingMode.HALF_UP);
                    return o.getGrandTotal().subtract(fee);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Ambil Riwayat Transaksi (Diurutkan dari yang terbaru)
        List<ShopTransaction> allTransactions = shopTransactionRepository.findAll();
        List<Map<String, Object>> transactions = allTransactions.stream()
                .filter(t -> t.getShop().getId().equals(shop.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", t.getId());
                    map.put("type", t.getType());
                    map.put("amount", t.getAmount());
                    map.put("description", t.getDescription());
                    map.put("date", t.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        // 4. Bungkus dan kirim ke Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("balance", activeBalance);
        response.put("heldBalance", heldBalance);
        response.put("transactions", transactions);

        return response;
    }
}