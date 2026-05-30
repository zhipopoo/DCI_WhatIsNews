package com.whatisnews.mapper;

import com.whatisnews.dto.NewsDTO;
import com.whatisnews.entity.News;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NewsMapper {

    @Mapping(target = "categoryName", source = "category.name")
    NewsDTO toDTO(News news);
}
