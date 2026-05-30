package com.whatisnews.controller;

import com.whatisnews.common.Result;
import com.whatisnews.dto.PageResult;
import com.whatisnews.entity.MediaFile;
import com.whatisnews.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /** Upload a file (supports image primarily) */
    @PostMapping("/upload")
    public Result<MediaFile> uploadFile(@RequestParam("file") MultipartFile file) {
        MediaFile mediaFile = mediaService.uploadFile(file);
        return Result.success("File uploaded", mediaFile);
    }

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
}
