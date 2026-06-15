package com.whatisnew.service;

import com.whatisnew.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {

    /** Public: get all categories ordered by sort_order */
    List<CategoryDTO> getAllCategories();

    /** Public: get category by slug */
    CategoryDTO getCategoryBySlug(String slug);

    /** Admin: create category */
    CategoryDTO createCategory(CategoryDTO dto);

    /** Admin: update category */
    CategoryDTO updateCategory(Long id, CategoryDTO dto);

    /** Admin: delete category */
    void deleteCategory(Long id);
}
