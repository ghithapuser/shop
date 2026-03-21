package com.shop.backend.controller;

import com.shop.backend.security.JwtUtil;
import com.shop.backend.entity.User;
import com.shop.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Đăng ký
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Đăng nhập
    @PostMapping("/login")
public String login(@RequestBody User user) {
    Optional<User> result = userService.login(user.getUsername(), user.getPassword());

    if (result.isPresent()) {
        User dbUser = result.get(); // 🔥 lấy từ DB

        return JwtUtil.generateToken(
                dbUser.getUsername(),
                dbUser.getRole().name()
        );
    }

    return "LOGIN FAILED";
}

}
