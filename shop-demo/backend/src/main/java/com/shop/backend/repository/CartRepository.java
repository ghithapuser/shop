package com.shop.backend.repository;

import com.shop.backend.entity.Cart;
import com.shop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserUsername(String username);

    Optional<Cart> findByUser(User user);
}