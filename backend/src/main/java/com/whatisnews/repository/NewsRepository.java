package com.whatisnews.repository;

import com.whatisnews.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    /** Find published, non-deleted news by ID */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.id = :id AND n.isDeleted = false")
    Optional<News> findByIdActive(@Param("id") Long id);

    /** Find all published and non-deleted news, ordered by published date desc */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isPublished = true AND n.isDeleted = false")
    Page<News> findAllPublished(Pageable pageable);

    /** Find published news by category */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isPublished = true AND n.isDeleted = false AND n.categoryId = :categoryId")
    Page<News> findByCategoryIdPublished(@Param("categoryId") Long categoryId, Pageable pageable);

    /** Search published news by title or content */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isPublished = true AND n.isDeleted = false AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<News> searchPublished(@Param("keyword") String keyword, Pageable pageable);

    /** Get top/sticky published news */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isPublished = true AND n.isDeleted = false AND n.isTop = true ORDER BY n.publishedAt DESC")
    List<News> findTopNews(Pageable pageable);

    /** Get latest published news */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isPublished = true AND n.isDeleted = false ORDER BY n.publishedAt DESC")
    List<News> findLatestNews(Pageable pageable);

    /** Get previous published news (for navigation) */
    @Query("SELECT n FROM News n WHERE n.isPublished = true AND n.isDeleted = false AND n.publishedAt < :publishedAt ORDER BY n.publishedAt DESC")
    List<News> findPrevNews(@Param("publishedAt") java.time.LocalDateTime publishedAt, Pageable pageable);

    /** Get next published news (for navigation) */
    @Query("SELECT n FROM News n WHERE n.isPublished = true AND n.isDeleted = false AND n.publishedAt > :publishedAt ORDER BY n.publishedAt ASC")
    List<News> findNextNews(@Param("publishedAt") java.time.LocalDateTime publishedAt, Pageable pageable);

    /** Count news by category (for category management) */
    @Query("SELECT COUNT(n) FROM News n WHERE n.categoryId = :categoryId AND n.isDeleted = false")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    /** Admin: find all non-deleted news with pagination */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.isDeleted = false")
    Page<News> findAllAdmin(Pageable pageable);

    /** Admin: find by ID including soft-deleted */
    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category WHERE n.id = :id")
    Optional<News> findByIdAdmin(@Param("id") Long id);

    /** Soft delete */
    @Modifying
    @Query("UPDATE News n SET n.isDeleted = true, n.updatedAt = CURRENT_TIMESTAMP WHERE n.id = :id")
    void softDelete(@Param("id") Long id);

    /** Increment view count */
    @Modifying
    @Query("UPDATE News n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
