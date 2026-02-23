package com.ecommerce.backend.config;

import com.ecommerce.backend.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Tangkap Header "Authorization" dari Postman
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. Jika tidak ada token atau formatnya salah, suruh dia pergi (blokir)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Ambil isi tokennya saja (buang tulisan "Bearer ")
        jwt = authHeader.substring(7);
        
        try {
            // 4. Minta Pabrik (JwtService) untuk mengekstrak email dari token
            userEmail = jwtService.extractUsername(jwt);

            // 5. Cek kecocokan dan validasi
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                // 6. Jika Valid! Beri cap "Telah Lolos Keamanan" dan izinkan masuk
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            // 7. Silakan masuk ke Controller yang dituju!
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // 🔥 JIKA TOKEN PALSU / KADALUARSA, SATPAM MEMBALAS DENGAN JSON RAPI (401 UNAUTHORIZED)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\": 401, \"message\": \"Akses Ditolak: Token JWT tidak valid, rusak, atau sudah kadaluarsa!\", \"data\": null}");
        } 
        
    }
}