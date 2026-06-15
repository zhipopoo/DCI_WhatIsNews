package com.whatisnew.service;

import com.whatisnew.dto.ChunkedUploadStatus;
import com.whatisnew.entity.MediaFile;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for chunked, resumable file uploads.
 */
public interface ChunkedUploadService {

    /**
     * Initialize a chunked upload session.
     * @return the generated upload session ID
     */
    String initUpload(String fileName, long fileSize, int totalChunks, long chunkSize, String mimeType);

    /**
     * Upload a single chunk.
     */
    void uploadChunk(String uploadId, int chunkIndex, MultipartFile chunkFile);

    /**
     * Complete the upload: merge all chunks, create MediaFile record, clean up temp files.
     * @return the final MediaFile entity
     */
    MediaFile completeUpload(String uploadId);

    /**
     * Get the current status of a chunked upload session.
     */
    ChunkedUploadStatus getStatus(String uploadId);

    /**
     * Cancel an upload and delete all temp files.
     */
    void cancelUpload(String uploadId);

    /**
     * Clean up expired upload sessions (older than 24 hours).
     */
    void cleanupExpiredSessions();
}
