package com.whatisnews.service.impl;

import com.whatisnews.dto.NewsDTO;
import com.whatisnews.dto.PageResult;
import com.whatisnews.entity.News;
import com.whatisnews.mapper.NewsMapper;
import com.whatisnews.repository.NewsRepository;
import com.whatisnews.service.NewsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;

    // ==================== Public Methods ====================

    @Override
    @Transactional
    public NewsDTO getPublishedNews(Long id) {
        News news = newsRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));
        newsRepository.incrementViewCount(id);
        NewsDTO dto = newsMapper.toDTO(news);

        // Set previous/next navigation
        if (news.getPublishedAt() != null) {
            List<News> prevList = newsRepository.findPrevNews(news.getPublishedAt(), PageRequest.of(0, 1));
            if (!prevList.isEmpty()) {
                dto.setPrevNews(NewsDTO.NewsNavDTO.builder()
                        .id(prevList.get(0).getId())
                        .title(prevList.get(0).getTitle())
                        .build());
            }
            List<News> nextList = newsRepository.findNextNews(news.getPublishedAt(), PageRequest.of(0, 1));
            if (!nextList.isEmpty()) {
                dto.setNextNews(NewsDTO.NewsNavDTO.builder()
                        .id(nextList.get(0).getId())
                        .title(nextList.get(0).getTitle())
                        .build());
            }
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<NewsDTO> listPublishedNews(Long categoryId, Pageable pageable) {
        Page<News> page;
        if (categoryId != null) {
            page = newsRepository.findByCategoryIdPublished(categoryId, pageable);
        } else {
            page = newsRepository.findAllPublished(pageable);
        }
        return toPageResult(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<NewsDTO> searchPublishedNews(String keyword, Pageable pageable) {
        Page<News> page = newsRepository.searchPublished(keyword, pageable);
        return toPageResult(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsDTO> getTopNews(int limit) {
        return newsRepository.findTopNews(PageRequest.of(0, limit)).stream()
                .map(newsMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsDTO> getLatestNews(int limit) {
        return newsRepository.findLatestNews(PageRequest.of(0, limit)).stream()
                .map(newsMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== Admin Methods ====================

    @Override
    @Transactional(readOnly = true)
    public PageResult<NewsDTO> listAllNews(Pageable pageable) {
        Page<News> page = newsRepository.findAllAdmin(pageable);
        return toPageResult(page);
    }

    @Override
    @Transactional(readOnly = true)
    public NewsDTO getNewsById(Long id) {
        News news = newsRepository.findByIdAdmin(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));
        return newsMapper.toDTO(news);
    }

    @Override
    public NewsDTO createNews(NewsDTO dto) {
        News news = News.builder()
                .title(dto.getTitle())
                .subtitle(dto.getSubtitle())
                .summary(dto.getSummary())
                .content(dto.getContent())
                .coverImage(dto.getCoverImage())
                .categoryId(dto.getCategoryId())
                .tags(dto.getTags())
                .author(dto.getAuthor() != null ? dto.getAuthor() : "WhatIsNews Editor")
                .isPublished(dto.getIsPublished() != null ? dto.getIsPublished() : false)
                .isTop(dto.getIsTop() != null ? dto.getIsTop() : false)
                .build();

        news = newsRepository.save(news);
        log.info("Created news: id={}, title={}", news.getId(), news.getTitle());
        return newsMapper.toDTO(news);
    }

    @Override
    public NewsDTO updateNews(Long id, NewsDTO dto) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));

        news.setTitle(dto.getTitle());
        news.setSubtitle(dto.getSubtitle());
        news.setSummary(dto.getSummary());
        news.setContent(dto.getContent());
        news.setCoverImage(dto.getCoverImage());
        news.setCategoryId(dto.getCategoryId());
        news.setTags(dto.getTags());
        if (dto.getAuthor() != null) {
            news.setAuthor(dto.getAuthor());
        }
        if (dto.getIsPublished() != null) {
            news.setIsPublished(dto.getIsPublished());
            if (dto.getIsPublished() && news.getPublishedAt() == null) {
                news.setPublishedAt(java.time.LocalDateTime.now());
            }
        }
        if (dto.getIsTop() != null) {
            news.setIsTop(dto.getIsTop());
        }

        news = newsRepository.save(news);
        log.info("Updated news: id={}", news.getId());
        return newsMapper.toDTO(news);
    }

    @Override
    public void deleteNews(Long id) {
        newsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));
        newsRepository.softDelete(id);
        log.info("Soft-deleted news: id={}", id);
    }

    @Override
    public void togglePublish(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));
        news.setIsPublished(!news.getIsPublished());
        if (news.getIsPublished() && news.getPublishedAt() == null) {
            news.setPublishedAt(java.time.LocalDateTime.now());
        }
        newsRepository.save(news);
        log.info("Toggled publish status: id={}, isPublished={}", id, news.getIsPublished());
    }

    @Override
    public void toggleTop(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found: " + id));
        news.setIsTop(!news.getIsTop());
        newsRepository.save(news);
        log.info("Toggled top status: id={}, isTop={}", id, news.getIsTop());
    }

    // ==================== Private Helpers ====================

    private PageResult<NewsDTO> toPageResult(Page<News> page) {
        List<NewsDTO> content = page.getContent().stream()
                .map(newsMapper::toDTO)
                .collect(Collectors.toList());

        return PageResult.<NewsDTO>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
