package com.whatisnews.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.whatisnews.dto.ChunkedUploadStatus;
import com.whatisnews.entity.MediaFile;
import com.whatisnews.repository.MediaFileRepository;
import com.whatisnews.service.ChunkedUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
public class ChunkedUploadServiceImpl implements ChunkedUploadService {

    private final MediaFileRepository mediaFileRepository;
    private final String uploadDir;
    private final ObjectMapper objectMapper;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );
    private static final List<String> ALLOWED_DOC_TYPES = List.of(
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public ChunkedUploadServiceImpl(MediaFileRepository mediaFileRepository,
                                    @Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.mediaFileRepository = mediaFileRepository;
        this.uploadDir = uploadDir;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    private Path getChunksDir() {
        return Paths.get(uploadDir, "chunks");
    }

    private Path getSessionDir(String uploadId) {
        return getChunksDir().resolve(uploadId);
    }

    private Path getSessionFile(String uploadId) {
        return getSessionDir(uploadId).resolve("session.json");
    }

    // ---- Internal session metadata ----
    private static class SessionMeta {
        public String fileName;
        public long fileSize;
        public int totalChunks;
        public long chunkSize;
        public String mimeType;
        public Instant createdAt;
        public String status; // IN_PROGRESS, COMPLETED
    }

    @Override
    public String initUpload(String fileName, long fileSize, int totalChunks, long chunkSize, String mimeType) {
        String uploadId = UUID.randomUUID().toString();
        Path sessionDir = getSessionDir(uploadId);
        try {
            Files.createDirectories(sessionDir);

            SessionMeta meta = new SessionMeta();
            meta.fileName = fileName;
            meta.fileSize = fileSize;
            meta.totalChunks = totalChunks;
            meta.chunkSize = chunkSize;
            meta.mimeType = mimeType;
            meta.createdAt = Instant.now();
            meta.status = "IN_PROGRESS";

            objectMapper.writeValue(getSessionFile(uploadId).toFile(), meta);
            log.info("Chunked upload initialized: uploadId={}, fileName={}, totalChunks={}", uploadId, fileName, totalChunks);
            return uploadId;
        } catch (IOException e) {
            log.error("Failed to initialize chunked upload for {}", fileName, e);
            throw new RuntimeException("Failed to initialize upload session", e);
        }
    }

    @Override
    public void uploadChunk(String uploadId, int chunkIndex, MultipartFile chunkFile) {
        Path sessionDir = getSessionDir(uploadId);
        if (!Files.exists(sessionDir)) {
            throw new IllegalArgumentException("Upload session not found: " + uploadId);
        }

        // Validate session still in progress
        SessionMeta meta = readSessionMeta(uploadId);
        if ("COMPLETED".equals(meta.status)) {
            throw new IllegalStateException("Upload session already completed: " + uploadId);
        }

        Path chunkPath = sessionDir.resolve(chunkIndex + ".part");
        try {
            Files.copy(chunkFile.getInputStream(), chunkPath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            log.debug("Chunk uploaded: uploadId={}, chunkIndex={}", uploadId, chunkIndex);
        } catch (IOException e) {
            log.error("Failed to upload chunk {} for {}", chunkIndex, uploadId, e);
            throw new RuntimeException("Failed to upload chunk", e);
        }
    }

    @Override
    @Transactional
    public MediaFile completeUpload(String uploadId) {
        SessionMeta meta = readSessionMeta(uploadId);
        Path sessionDir = getSessionDir(uploadId);

        // Validate all chunks present
        for (int i = 0; i < meta.totalChunks; i++) {
            Path chunkPath = sessionDir.resolve(i + ".part");
            if (!Files.exists(chunkPath)) {
                throw new IllegalStateException("Missing chunk " + i + " for upload " + uploadId);
            }
        }

        // Generate stored name
        String extension = getExtension(meta.fileName);
        String storedName = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(uploadDir, storedName);

        try {
            // Ensure upload directory exists
            Files.createDirectories(Paths.get(uploadDir));

            // Merge chunks sequentially into final file
            try (OutputStream out = new FileOutputStream(targetPath.toFile())) {
                for (int i = 0; i < meta.totalChunks; i++) {
                    Path chunkPath = sessionDir.resolve(i + ".part");
                    try (InputStream in = new FileInputStream(chunkPath.toFile())) {
                        byte[] buffer = new byte[8192];
                        int bytesRead;
                        while ((bytesRead = in.read(buffer)) != -1) {
                            out.write(buffer, 0, bytesRead);
                        }
                    }
                }
            }

            // Determine file type
            String fileType = determineFileType(meta.mimeType);

            // Save media metadata
            MediaFile mediaFile = MediaFile.builder()
                    .originalName(meta.fileName)
                    .storedName(storedName)
                    .filePath("/uploads/" + storedName)
                    .fileSize(meta.fileSize)
                    .mimeType(meta.mimeType)
                    .fileType(fileType)
                    .build();
            mediaFile = mediaFileRepository.save(mediaFile);

            // Mark session as completed
            meta.status = "COMPLETED";
            objectMapper.writeValue(getSessionFile(uploadId).toFile(), meta);

            // Clean up chunk temp directory
            deleteSessionDir(uploadId);

            log.info("Chunked upload completed: uploadId={}, fileName={}, storedName={}", uploadId, meta.fileName, storedName);
            return mediaFile;
        } catch (IOException e) {
            log.error("Failed to complete upload {}", uploadId, e);
            // Clean up partial output file
            try {
                Files.deleteIfExists(targetPath);
            } catch (IOException ignored) {}
            throw new RuntimeException("Failed to complete upload", e);
        }
    }

    @Override
    public ChunkedUploadStatus getStatus(String uploadId) {
        Path sessionDir = getSessionDir(uploadId);
        if (!Files.exists(sessionDir)) {
            throw new IllegalArgumentException("Upload session not found: " + uploadId);
        }

        SessionMeta meta = readSessionMeta(uploadId);

        // Scan which chunk files exist on disk
        Set<Integer> uploadedChunks = new HashSet<>();
        try (Stream<Path> files = Files.list(sessionDir)) {
            files.forEach(path -> {
                String name = path.getFileName().toString();
                if (name.endsWith(".part")) {
                    try {
                        int idx = Integer.parseInt(name.replace(".part", ""));
                        uploadedChunks.add(idx);
                    } catch (NumberFormatException ignored) {}
                }
            });
        } catch (IOException ignored) {}

        return ChunkedUploadStatus.builder()
                .uploadId(uploadId)
                .fileName(meta.fileName)
                .fileSize(meta.fileSize)
                .totalChunks(meta.totalChunks)
                .chunkSize(meta.chunkSize)
                .status(meta.status)
                .uploadedChunks(uploadedChunks)
                .createdAt(meta.createdAt)
                .build();
    }

    @Override
    public void cancelUpload(String uploadId) {
        deleteSessionDir(uploadId);
        log.info("Upload cancelled and cleaned up: uploadId={}", uploadId);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *")  // run every hour
    public void cleanupExpiredSessions() {
        Path chunksDir = getChunksDir();
        if (!Files.exists(chunksDir)) return;

        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);

        try (Stream<Path> dirs = Files.list(chunksDir)) {
            dirs.filter(Files::isDirectory).forEach(sessionDir -> {
                try {
                    Path metaFile = sessionDir.resolve("session.json");
                    if (!Files.exists(metaFile)) {
                        // orphan directory, delete it
                        deleteDir(sessionDir);
                        return;
                    }
                    SessionMeta meta = objectMapper.readValue(metaFile.toFile(), SessionMeta.class);
                    if (meta.createdAt != null && meta.createdAt.isBefore(cutoff)) {
                        log.info("Cleaning up expired upload session: {}", sessionDir.getFileName());
                        deleteDir(sessionDir);
                    }
                } catch (IOException e) {
                    log.warn("Failed to read session meta, deleting directory: {}", sessionDir, e);
                    deleteDir(sessionDir);
                }
            });
        } catch (IOException e) {
            log.warn("Failed to list chunk directories for cleanup", e);
        }
    }

    // ---- Private helpers ----

    private SessionMeta readSessionMeta(String uploadId) {
        Path metaFile = getSessionFile(uploadId);
        if (!Files.exists(metaFile)) {
            throw new IllegalArgumentException("Upload session not found: " + uploadId);
        }
        try {
            return objectMapper.readValue(metaFile.toFile(), SessionMeta.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read session metadata for " + uploadId, e);
        }
    }

    private void deleteSessionDir(String uploadId) {
        Path sessionDir = getSessionDir(uploadId);
        deleteDir(sessionDir);
    }

    private void deleteDir(Path dir) {
        if (!Files.exists(dir)) return;
        try (Stream<Path> paths = Files.walk(dir)) {
            paths.sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try { Files.deleteIfExists(path); }
                        catch (IOException e) { log.warn("Failed to delete: {}", path, e); }
                    });
        } catch (IOException e) {
            log.warn("Failed to walk directory for deletion: {}", dir, e);
        }
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
}
