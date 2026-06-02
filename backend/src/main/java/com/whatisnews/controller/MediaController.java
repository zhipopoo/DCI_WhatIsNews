package com.whatisnews.controller;

import com.whatisnews.common.Result;
import com.whatisnews.dto.ChunkedUploadStatus;
import com.whatisnews.dto.InitChunkedUploadRequest;
import com.whatisnews.dto.PageResult;
import com.whatisnews.entity.MediaFile;
import com.whatisnews.service.ChunkedUploadService;
import com.whatisnews.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private final ChunkedUploadService chunkedUploadService;

    // ======================== Single-file upload ========================

    /** Upload a file (supports image primarily) */
    @PostMapping("/upload")
    public Result<MediaFile> uploadFile(@RequestParam("file") MultipartFile file) {
        MediaFile mediaFile = mediaService.uploadFile(file);
        return Result.success("File uploaded", mediaFile);
    }

    // ======================== Chunked / resumable upload ========================

    /** Initialize a chunked upload session */
    @PostMapping("/upload/init")
    public Result<Map<String, String>> initChunkedUpload(@RequestBody InitChunkedUploadRequest request) {
        String uploadId = chunkedUploadService.initUpload(
                request.getFileName(),
                request.getFileSize(),
                request.getTotalChunks(),
                request.getChunkSize(),
                request.getMimeType()
        );
        return Result.success(Map.of("uploadId", uploadId));
    }

    /** Upload a single chunk */
    @PostMapping("/upload/chunk")
    public Result<Map<String, Object>> uploadChunk(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("chunkIndex") int chunkIndex,
            @RequestParam("file") MultipartFile file) {
        chunkedUploadService.uploadChunk(uploadId, chunkIndex, file);
        return Result.success(Map.of("uploadId", uploadId, "chunkIndex", chunkIndex, "received", true));
    }

    /** Complete the chunked upload, merge chunks, and create media record */
    @PostMapping("/upload/complete")
    public Result<MediaFile> completeChunkedUpload(@RequestBody Map<String, String> body) {
        String uploadId = body.get("uploadId");
        if (uploadId == null || uploadId.isBlank()) {
            return Result.badRequest("uploadId is required");
        }
        MediaFile mediaFile = chunkedUploadService.completeUpload(uploadId);
        return Result.success("File uploaded", mediaFile);
    }

    /** Get the status of a chunked upload (for resuming) */
    @GetMapping("/upload/status/{uploadId}")
    public Result<ChunkedUploadStatus> getChunkedUploadStatus(@PathVariable String uploadId) {
        ChunkedUploadStatus status = chunkedUploadService.getStatus(uploadId);
        return Result.success(status);
    }

    /** Cancel a chunked upload and clean up temp files */
    @DeleteMapping("/upload/cancel/{uploadId}")
    public Result<Void> cancelChunkedUpload(@PathVariable String uploadId) {
        chunkedUploadService.cancelUpload(uploadId);
        return Result.ok("Upload cancelled");
    }

    // ======================== Media CRUD ========================

    /** List all media files */
    @GetMapping
    public Result<PageResult<MediaFile>> listFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResult<MediaFile> result = mediaService.listFiles(pageable);
        return Result.success(result);
    }

    /** Delete a media file */
    @DeleteMapping("/{id}")
    public Result<Void> deleteFile(@PathVariable Long id) {
        mediaService.deleteFile(id);
        return Result.ok("File deleted");
    }

    /** Get articles that reference a given media file */
    @GetMapping("/{id}/references")
    public Result<java.util.List<java.util.Map<String, Object>>> getReferences(@PathVariable Long id) {
        return Result.success(mediaService.getReferencingArticles(id));
    }
}
