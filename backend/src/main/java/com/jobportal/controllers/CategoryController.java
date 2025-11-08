package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.CategoryResource;
import com.jobportal.entities.Category;
import com.jobportal.mappers.CategoryMapper;
import com.jobportal.services.interfaces.CategoryServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/categories")
public class CategoryController {
    private final CategoryServiceInterface categoryService;
    private final CategoryMapper categoryMapper;

    @GetMapping()
    public ResponseEntity<?> list(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Category> categories = categoryService.getAllCategories(params);
        List<CategoryResource> resources = categoryMapper.tResourceList(categories);
        ApiResource<List<CategoryResource>> response = ApiResource.ok(resources, "Success");
        return ResponseEntity.ok(response);
    }
}
