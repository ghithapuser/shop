package com.shop.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/common")
public class CommonController {

    @GetMapping("/me")
    public Object me(Authentication authentication) {
        return authentication;
    }
}