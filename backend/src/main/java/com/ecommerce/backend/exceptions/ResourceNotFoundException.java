package com.ecommerce.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
// Menandakan bahwa jika error ini terjadi, status HTTP-nya adalah 404 NOT FOUND
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message); // Memanggil konstruktor dari RuntimeException dengan pesan error
    }
    
}
