package com.shop.backend.controller;

import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/test")
    public String userTest() {
        return "Hello USER - Access granted!";
    }
}