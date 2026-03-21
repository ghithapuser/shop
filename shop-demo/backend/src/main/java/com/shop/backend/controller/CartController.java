package com.shop.backend.controller;

import com.shop.backend.entity.Cart;
import com.shop.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin("*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(Principal principal, @RequestParam Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.addToCart(principal.getName(), productId, quantity));
    }

    @GetMapping
    public ResponseEntity<Cart> getMyCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestParam Long productId, Principal principal) {
        String username = principal.getName();
        cartService.removeFromCart(username, productId);
        return ResponseEntity.ok("Đã xoá sản phẩm khỏi giỏ hàng");
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(Principal principal) {
        try {
            cartService.checkout(principal.getName());
            return ResponseEntity.ok("Thanh toán thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}