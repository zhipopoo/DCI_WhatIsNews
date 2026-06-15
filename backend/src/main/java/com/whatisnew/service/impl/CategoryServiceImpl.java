package com.whatisnew.service.impl;

import com.whatisnew.dto.CategoryDTO;
import com.whatisnew.entity.Category;
import com.whatisnew.mapper.CategoryMapper;
import com.whatisnew.repository.CategoryRepository;
import com.whatisnew.repository.NewsRepository;
import com.whatisnew.service.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final NewsRepository newsRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(category -> {
                    CategoryDTO dto = categoryMapper.toDTO(category);
                    dto.setNewsCount(newsRepository.countByCategoryId(category.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + slug));
        CategoryDTO dto = categoryMapper.toDTO(category);
        dto.setNewsCount(newsRepository.countByCategoryId(category.getId()));
        return dto;
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new IllegalArgumentException("Category slug already exists: " + dto.getSlug());
        }
        Category category = Category.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .build();
        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));

        if (dto.getSlug() != null && categoryRepository.existsBySlugAndIdNot(dto.getSlug(), id)) {
            throw new IllegalArgumentException("Category slug already exists: " + dto.getSlug());
        }

        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getSlug() != null) category.setSlug(dto.getSlug());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) category.setSortOrder(dto.getSortOrder());

        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        long newsCount = newsRepository.countByCategoryId(id);
        if (newsCount > 0) {
            throw new IllegalArgumentException("Cannot delete category with " + newsCount + " news articles. Remove or reassign them first.");
        }
        categoryRepository.delete(category);
        log.info("Deleted category: id={}, name={}", id, category.getName());
    }
}
