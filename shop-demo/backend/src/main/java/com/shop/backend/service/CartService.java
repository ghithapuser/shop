package com.shop.backend.service;

import com.shop.backend.entity.*;
import com.shop.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart addToCart(String username, Long productId, int quantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    public Cart getCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUser(user).orElse(new Cart());
    }

    public void removeFromCart(String username, Long productId) {
        Cart cart = cartRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        // Lọc bỏ sản phẩm có ID tương ứng ra khỏi danh sách items
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        cartRepository.save(cart);
    }

    @Transactional
    public void checkout(String username) {
        Cart cart = cartRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng của bạn đang trống!");
        }

        // 1. Duyệt qua từng món hàng để trừ số lượng trong kho
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            int remainingQty = product.getQuantity() - item.getQuantity();

            if (remainingQty < 0) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ hàng!");
            }

            product.setQuantity(remainingQty);
            // Lưu lại số lượng mới vào bảng Product
        }

        // 2. Xóa toàn bộ sản phẩm trong giỏ sau khi thanh toán xong
        cart.getItems().clear();
        cartRepository.save(cart);
    }
    
}