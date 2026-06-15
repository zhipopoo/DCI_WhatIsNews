package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.NewsDTO;
import com.whatisnew.dto.PageResult;
import com.whatisnew.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * News controller — public read endpoints + admin CRUD endpoints.
 */
@RestController
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    // ==================== Public Endpoints ====================

    /** Get published news detail (public) */
    @GetMapping("/api/news/{id}")
    public Result<NewsDTO> getPublishedNews(@PathVariable Long id) {
        NewsDTO dto = newsService.getPublishedNews(id);
        return Result.success(dto);
    }

    /** List published news with optional category filter (public) */
    @GetMapping("/api/news")
    public Result<PageResult<NewsDTO>> listPublishedNews(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        PageResult<NewsDTO> result = newsService.listPublishedNews(categoryId, pageable);
        return Result.success(result);
    }

    /** Search published news (public) */
    @GetMapping("/api/news/search")
    public Result<PageResult<NewsDTO>> searchNews(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        PageResult<NewsDTO> result = newsService.searchPublishedNews(keyword, pageable);
        return Result.success(result);
    }

    /** Get top/sticky news (public) */
    @GetMapping("/api/news/featured/top")
    public Result<List<NewsDTO>> getTopNews(@RequestParam(defaultValue = "5") int limit) {
        List<NewsDTO> list = newsService.getTopNews(limit);
        return Result.success(list);
    }

    /** Get latest news (public) */
    @GetMapping("/api/news/featured/latest")
    public Result<List<NewsDTO>> getLatestNews(@RequestParam(defaultValue = "6") int limit) {
        List<NewsDTO> list = newsService.getLatestNews(limit);
        return Result.success(list);
    }

    // ==================== Admin Endpoints ====================

    /** Admin: list all news */
    @GetMapping("/api/admin/news")
    public Result<PageResult<NewsDTO>> listAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResult<NewsDTO> result = newsService.listAllNews(pageable);
        return Result.success(result);
    }

    /** Admin: get single news (any state) */
    @GetMapping("/api/admin/news/{id}")
    public Result<NewsDTO> getNews(@PathVariable Long id) {
        NewsDTO dto = newsService.getNewsById(id);
        return Result.success(dto);
    }

    /** Admin: create news */
    @PostMapping("/api/admin/news")
    public Result<NewsDTO> createNews(@RequestBody NewsDTO dto) {
        NewsDTO created = newsService.createNews(dto);
        return Result.success("News created", created);
    }

    /** Admin: update news */
    @PutMapping("/api/admin/news/{id}")
    public Result<NewsDTO> updateNews(@PathVariable Long id, @RequestBody NewsDTO dto) {
        NewsDTO updated = newsService.updateNews(id, dto);
        return Result.success("News updated", updated);
    }

    /** Admin: soft delete news */
    @DeleteMapping("/api/admin/news/{id}")
    public Result<Void> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return Result.ok("News deleted");
    }

    /** Admin: toggle publish status */
    @PatchMapping("/api/admin/news/{id}/publish")
    public Result<Void> togglePublish(@PathVariable Long id) {
        newsService.togglePublish(id);
        return Result.success();
    }

    /** Admin: toggle top/sticky status */
    @PatchMapping("/api/admin/news/{id}/top")
    public Result<Void> toggleTop(@PathVariable Long id) {
        newsService.toggleTop(id);
        return Result.success();
    }
}
