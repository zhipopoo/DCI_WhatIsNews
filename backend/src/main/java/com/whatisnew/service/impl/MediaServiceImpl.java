package com.whatisnew.service.impl;

import com.whatisnew.dto.PageResult;
import com.whatisnew.entity.MediaFile;
import com.whatisnew.repository.MediaFileRepository;
import com.whatisnew.repository.NewsRepository;
import com.whatisnew.service.MediaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MediaServiceImpl implements MediaService {

    private final MediaFileRepository mediaFileRepository;
    private final NewsRepository newsRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /** Allowed image MIME types */
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    /** Allowed document types */
    private static final List<String> ALLOWED_DOC_TYPES = List.of(
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Override
    public MediaFile uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String mimeType = file.getContentType();
        String fileType = determineFileType(mimeType);

        // Generate unique stored name
        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        String storedName = UUID.randomUUID().toString() + extension;

        // Create upload directory
        Path uploadPath = Paths.get(uploadDir);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Save metadata
            MediaFile mediaFile = MediaFile.builder()
                    .originalName(originalName)
                    .storedName(storedName)
                    .filePath("/uploads/" + storedName)
                    .fileSize(file.getSize())
                    .mimeType(mimeType)
                    .fileType(fileType)
                    .build();

            mediaFile = mediaFileRepository.save(mediaFile);
            log.info("Uploaded file: {} -> {}", originalName, storedName);
            return mediaFile;

        } catch (IOException e) {
            log.error("Failed to upload file: {}", originalName, e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<MediaFile> listFiles(Pageable pageable) {
        Page<MediaFile> page = mediaFileRepository.findAllByOrderByCreatedAtDesc(pageable);

        return PageResult.<MediaFile>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    public void deleteFile(Long id) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media file not found: " + id));

        // Delete physical file
        try {
            Path filePath = Paths.get(uploadDir, mediaFile.getStoredName());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete physical file: {}", mediaFile.getStoredName(), e);
        }

        mediaFileRepository.delete(mediaFile);
        log.info("Deleted media file: id={}, name={}", id, mediaFile.getOriginalName());
    }

    private String determineFileType(String mimeType) {
        if (mimeType == null) return "OTHER";
        if (ALLOWED_IMAGE_TYPES.contains(mimeType)) return "IMAGE";
        if (ALLOWED_DOC_TYPES.contains(mimeType)) return "DOCUMENT";
        if (mimeType.startsWith("video/")) return "VIDEO";
        return "OTHER";
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }

    @Override
    public List<Map<String, Object>> getReferencingArticles(Long mediaId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaId)
                .orElseThrow(() -> new EntityNotFoundException("Media file not found: " + mediaId));

        List<Object[]> results = newsRepository.findTitleByIdByContentContaining(mediaFile.getFilePath());
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("title", row[1]);
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
}
