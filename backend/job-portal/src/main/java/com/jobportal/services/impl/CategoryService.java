package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.resources.CategoryResource;
import com.jobportal.entities.Category;
import com.jobportal.mappers.CategoryMapper;
import com.jobportal.repositories.CategoryRepository;
import com.jobportal.services.interfaces.CategoryServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CategoryService extends BaseService implements CategoryServiceInterface {
    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> getAllCategories(Map<String, String[]> parameters) {
        Sort sort = sortParam(parameters);
        Specification<Category> specification = specificationParam(parameters);

        return categoryRepository.findAll(specification, sort);
    }
}
