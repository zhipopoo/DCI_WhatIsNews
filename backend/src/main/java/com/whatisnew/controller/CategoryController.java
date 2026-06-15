package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.CategoryDTO;
import com.whatisnew.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** Public: get all categories */
    @GetMapping("/api/categories")
    public Result<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> list = categoryService.getAllCategories();
        return Result.success(list);
    }

    /** Public: get category by slug */
    @GetMapping("/api/categories/{slug}")
    public Result<CategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        CategoryDTO dto = categoryService.getCategoryBySlug(slug);
        return Result.success(dto);
    }

    /** Admin: create category */
    @PostMapping("/api/admin/categories")
    public Result<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        CategoryDTO created = categoryService.createCategory(dto);
        return Result.success("Category created", created);
    }

    /** Admin: update category */
    @PutMapping("/api/admin/categories/{id}")
    public Result<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        CategoryDTO updated = categoryService.updateCategory(id, dto);
        return Result.success("Category updated", updated);
    }

    /** Admin: delete category */
    @DeleteMapping("/api/admin/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.ok("Category deleted");
    }
}
