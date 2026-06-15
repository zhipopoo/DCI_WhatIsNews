package com.whatisnew.mapper;

import com.whatisnew.dto.CategoryDTO;
import com.whatisnew.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDTO toDTO(Category category);
}
