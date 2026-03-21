package com.shop.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shop.backend.entity.Product;
import com.shop.backend.service.ProductService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    public AdminController(ProductService productService) {
        this.productService = productService;
    }

    // Thêm sản phẩm mới (POST)
    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.create(product));
    }

    // Sửa sản phẩm theo ID (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return ResponseEntity.ok(productService.update(id, productDetails));
    }

    // Xóa sản phẩm theo ID (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok("Đã xóa sản phẩm thành công!");
    }

    @GetMapping("/test")
    public String adminTest() {
        return "Hello ADMIN - Access granted!";
    }
}