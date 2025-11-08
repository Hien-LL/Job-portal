package com.jobportal.services.interfaces;

import com.jobportal.entities.Category;

import java.util.List;
import java.util.Map;

public interface CategoryServiceInterface {
    List<Category> getAllCategories(Map<String, String[]> parameters);
}
