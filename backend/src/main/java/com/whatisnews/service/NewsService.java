package com.whatisnews.service;

import com.whatisnews.dto.NewsDTO;
import com.whatisnews.dto.PageResult;
import org.springframework.data.domain.Pageable;

public interface NewsService {

    /** Public: get published news detail by ID (increments view count) */
    NewsDTO getPublishedNews(Long id);

    /** Public: list published news with optional category filter */
    PageResult<NewsDTO> listPublishedNews(Long categoryId, Pageable pageable);

    /** Public: search published news */
    PageResult<NewsDTO> searchPublishedNews(String keyword, Pageable pageable);

    /** Public: get top/sticky news */
    java.util.List<NewsDTO> getTopNews(int limit);

    /** Public: get latest news */
    java.util.List<NewsDTO> getLatestNews(int limit);

    // --- Admin operations ---

    /** Admin: list all non-deleted news */
    PageResult<NewsDTO> listAllNews(Pageable pageable);

    /** Admin: get news by ID (any state) */
    NewsDTO getNewsById(Long id);

    /** Admin: create news */
    NewsDTO createNews(NewsDTO dto);

    /** Admin: update news */
    NewsDTO updateNews(Long id, NewsDTO dto);

    /** Admin: soft delete news */
    void deleteNews(Long id);

    /** Admin: toggle publish status */
    void togglePublish(Long id);

    /** Admin: toggle top/sticky status */
    void toggleTop(Long id);
}
