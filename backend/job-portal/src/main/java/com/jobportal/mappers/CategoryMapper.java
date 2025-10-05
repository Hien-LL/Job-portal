package com.jobportal.mappers;

import com.jobportal.dtos.resources.CategoryResource;
import com.jobportal.entities.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResource toResource(Category category);

    List<CategoryResource> tResourceList(List<Category> categories);
}
