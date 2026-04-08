package com.ecommerce.backend.services;

import com.ecommerce.backend.dtos.AddressRequest;
import com.ecommerce.backend.dtos.AddressResponse;
import com.ecommerce.backend.exceptions.ResourceNotFoundException;
import com.ecommerce.backend.models.Address;
import com.ecommerce.backend.models.User;
import com.ecommerce.backend.repositories.AddressRepository;
import com.ecommerce.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {
    
    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    // --- FITUR MENAMBAH ALAMAT BARU ---
    @Transactional
    public AddressResponse addAddress(AddressRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User Tidak ditemukan"));
        
        List<Address> existingAddress = addressRepository.findByUser(user);

        boolean setAsPrimary = request.isPrimary();
        
        // Jika ini adalah alamat pertama yang dia buat, PAKSA jadi alamat utama
        if(existingAddress.isEmpty()) {
            setAsPrimary = true;
        }
        
        // Jika dia ingin ini jadi alamat utama, turunkan pangkat alamat utama yang lama
        else if(setAsPrimary) {
            existingAddress.forEach(addr -> {
                if(addr.isPrimary()) {
                    addr.setPrimary(false);
                }
            });
            addressRepository.saveAll(existingAddress);
        }

        Address newAddress = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phoneNumber(request.getPhoneNumber())
                .province(request.getProvince())
                .city(request.getCity())
                .district(request.getDistrict())
                .postalCode(request.getPostalCode())
                .streetDetails(request.getStreetDetails())
                .otherDetails(request.getOtherDetails())
                .label(request.getLabel())
                .isPrimary(setAsPrimary)
                .build();

        Address savedAddress = addressRepository.save(newAddress);
        return mapToResponse(savedAddress);
    }

    // --- FITUR MELIHAT SEMUA BUKU ALAMAT ---
    public List<AddressResponse> getUserAddresses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        return addressRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));
        
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Alamat tidak ditemukan!"));
        
        // Pastikan alamat ini benar-benar milik user yang sedang login
        if (!existingAddress.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Akses Ditolak! Ini bukan alamat Anda.");
        }

        boolean setAsPrimary = request.isPrimary();

        // Jika alamat ini diubah menjadi utama, turunkan pangkat alamat lain
        if (setAsPrimary && !existingAddress.isPrimary()) {
            List<Address> allUserAddresses = addressRepository.findByUser(user);
            allUserAddresses.forEach(addr -> {
                if (addr.isPrimary()) addr.setPrimary(false);
            });
            addressRepository.saveAll(allUserAddresses);
        }

        // Update data-datanya
        existingAddress.setRecipientName(request.getRecipientName());
        existingAddress.setPhoneNumber(request.getPhoneNumber());
        existingAddress.setProvince(request.getProvince());
        existingAddress.setCity(request.getCity());
        existingAddress.setDistrict(request.getDistrict());
        existingAddress.setPostalCode(request.getPostalCode());
        existingAddress.setStreetDetails(request.getStreetDetails());
        existingAddress.setOtherDetails(request.getOtherDetails());
        existingAddress.setLabel(request.getLabel());
        existingAddress.setPrimary(setAsPrimary);

        Address updatedAddress = addressRepository.save(existingAddress);
        return mapToResponse(updatedAddress);
    }

    // --- FITUR MENGHAPUS ALAMAT ---
    public void deleteAddress(Long addressId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan!"));

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Alamat tidak ditemukan!"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Akses Ditolak!");
        }

        addressRepository.delete(address);
    }

    // Helper mengubah Entity ke DTO
    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .province(address.getProvince())
                .city(address.getCity())
                .district(address.getDistrict())
                .postalCode(address.getPostalCode())
                .streetDetails(address.getStreetDetails())
                .otherDetails(address.getOtherDetails())
                .label(address.getLabel())
                .isPrimary(address.isPrimary())
                .build();
    }
}
