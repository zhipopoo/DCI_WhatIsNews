package com.whatisnew.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

/**
 * Status of a chunked upload session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChunkedUploadStatus {
    private String uploadId;
    private String fileName;
    private long fileSize;
    private int totalChunks;
    private long chunkSize;
    private String status;       // "IN_PROGRESS", "COMPLETED", "EXPIRED"
    private Set<Integer> uploadedChunks;
    private Instant createdAt;
}
