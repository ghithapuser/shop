package com.shop.backend.service;

import com.shop.backend.entity.User;
import com.shop.backend.entity.Role;
import com.shop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        // 1. Kiểm tra trùng username
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // 2. Gán Role mặc định nếu user gửi lên là null
        // Vì Role là Enum, ta so sánh trực tiếp với null
        if (user.getRole() == null) {
            user.setRole(Role.USER); // Gán giá trị USER từ Enum Role
        }

        return userRepository.save(user);
    }
    
    public Optional<User> login(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user;
        }

        return Optional.empty();
    }
}