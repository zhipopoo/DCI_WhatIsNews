package com.whatisnew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to initialize a chunked upload session.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitChunkedUploadRequest {
    private String fileName;
    private long fileSize;
    private int totalChunks;
    private long chunkSize;
    private String mimeType;
}
