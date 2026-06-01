package com.whatisnews.service;

import com.whatisnews.dto.PageResult;
import com.whatisnews.entity.MediaFile;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface MediaService {

    /** Upload a single file, returns the stored file info */
    MediaFile uploadFile(MultipartFile file);

    /** Admin: list all uploaded files with pagination */
    PageResult<MediaFile> listFiles(Pageable pageable);

    /** Admin: delete a file */
    void deleteFile(Long id);

    /** Get articles that reference a given media file */
    List<Map<String, Object>> getReferencingArticles(Long mediaId);
}
