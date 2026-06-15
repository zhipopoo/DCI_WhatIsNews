package com.whatisnew.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {

    private Long id;
    private String title;
    private String subtitle;
    private String summary;
    private String content;
    private String coverImage;
    private Long categoryId;
    private String categoryName;
    private String tags;
    private String author;
    private Boolean isPublished;
    private Boolean isTop;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    // For previous/next navigation
    private NewsNavDTO prevNews;
    private NewsNavDTO nextNews;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewsNavDTO {
        private Long id;
        private String title;
    }
}
