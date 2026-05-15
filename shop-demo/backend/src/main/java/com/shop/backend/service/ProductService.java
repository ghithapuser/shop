package com.shop.backend.service;

import com.shop.backend.entity.Product;
import com.shop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // 1. Lấy toàn bộ danh sách sản phẩm
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    // 2. Lấy 1 sản phẩm theo ID
    public Product getById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
    }

    // 3. Thêm sản phẩm mới
    public Product create(Product product) {
        return productRepository.save(product);
    }

    // 4. Sửa sản phẩm (Đã thêm đầy đủ Quantity)
    public Product update(Long id, Product newProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        existingProduct.setName(newProduct.getName());
        existingProduct.setPrice(newProduct.getPrice());
        existingProduct.setQuantity(newProduct.getQuantity());
        existingProduct.setImageUrl(newProduct.getImageUrl());
        existingProduct.setTags(newProduct.getTags());

        return productRepository.save(existingProduct);
    }

    // 5. Xóa sản phẩm
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
}