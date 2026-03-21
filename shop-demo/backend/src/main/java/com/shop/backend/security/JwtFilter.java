package com.shop.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String token = null;
        String username = null;
        String role = null;
        String path = request.getServletPath();

         if (path.startsWith("/api/auth")) {
        filterChain.doFilter(request, response);
        return;
        }

        // 🔥 1. Lấy token từ header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);

            try {
                username = JwtUtil.extractUsername(token);
                role = JwtUtil.extractRole(token);
            } catch (Exception e) {
                // Token lỗi (hết hạn / sai chữ ký)
                System.out.println("JWT Error: " + e.getMessage());
            }
        }

        // 🔥 2. Nếu có user và chưa authenticate
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 👉 Convert role -> authority
            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singleton(authority)
                    );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            // 🔥 3. Set vào context
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // 🔥 4. Tiếp tục filter chain
        filterChain.doFilter(request, response);
    }
}