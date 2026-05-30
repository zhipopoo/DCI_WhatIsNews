package com.whatisnews.mapper;

import com.whatisnews.dto.CategoryDTO;
import com.whatisnews.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDTO toDTO(Category category);
}
