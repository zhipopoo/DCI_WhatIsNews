package com.whatisnew.mapper;

import com.whatisnew.dto.NewsDTO;
import com.whatisnew.entity.News;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NewsMapper {

    @Mapping(target = "categoryName", source = "category.name")
    NewsDTO toDTO(News news);
}
