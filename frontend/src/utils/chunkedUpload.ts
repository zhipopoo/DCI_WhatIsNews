import {
  uploadFile,
  initChunkedUpload,
  uploadChunk,
  completeChunkedUpload,
  getChunkedUploadStatus,
  cancelChunkedUpload,
} from '@/api/media';
import type { MediaFile } from '@/types';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk
const SINGLE_UPLOAD_THRESHOLD = 1 * 1024 * 1024; // 1 MB — below this use single-shot upload
const MAX_CHUNK_RETRIES = 3;

export interface ChunkedUploadCallbacks {
  onProgress?: (percent: number) => void;
  onUploadId?: (uploadId: string) => void;
}

/**
 * Smart upload: auto-selects single-shot vs chunked upload based on file size.
 * Files ≤1 MB use the existing single-shot endpoint for speed.
 * Files >1 MB use chunked upload with progress tracking and resume support.
 */
export async function smartUploadFile(
  file: File,
  callbacks?: ChunkedUploadCallbacks
): Promise<MediaFile> {
  if (file.size <= SINGLE_UPLOAD_THRESHOLD) {
    // Small file: use single-shot upload
    const res = await uploadFile(file);
    callbacks?.onProgress?.(100);
    return res.data;
  }
  // Large file: use chunked upload
  return uploadChunkedFile(file, callbacks);
}

/**
 * Upload a file using chunked, resumable upload.
 * Automatically resumes a failed upload by checking server-side chunk status.
 */
export async function uploadChunkedFile(
  file: File,
  callbacks?: ChunkedUploadCallbacks,
  resumeUploadId?: string
): Promise<MediaFile> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  let uploadId: string;
  let startChunkIndex = 0;

  // If resuming, check which chunks are already uploaded on the server
  if (resumeUploadId) {
    try {
      const status = await getChunkedUploadStatus(resumeUploadId);
      if (status.code === 200 && status.data.status === 'IN_PROGRESS') {
        uploadId = resumeUploadId;
        callbacks?.onUploadId?.(uploadId);
        const uploaded = new Set(status.data.uploadedChunks);
        // Find the first missing chunk
        while (startChunkIndex < totalChunks && uploaded.has(startChunkIndex)) {
          startChunkIndex++;
        }
      } else {
        // Session expired or completed, start fresh
        uploadId = await initUpload(file);
        callbacks?.onUploadId?.(uploadId);
      }
    } catch {
      // Status check failed, start fresh
      uploadId = await initUpload(file);
      callbacks?.onUploadId?.(uploadId);
    }
  } else {
    uploadId = await initUpload(file);
    callbacks?.onUploadId?.(uploadId);
  }

  // Upload chunks sequentially with retry
  for (let i = startChunkIndex; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    let success = false;
    for (let attempt = 0; attempt < MAX_CHUNK_RETRIES; attempt++) {
      try {
        await uploadChunk(uploadId, i, chunk);
        success = true;
        break;
      } catch (err) {
        if (attempt < MAX_CHUNK_RETRIES - 1) {
          // Wait before retry (exponential backoff: 1s, 2s, 4s)
          await sleep(1000 * Math.pow(2, attempt));
        } else {
          throw new Error(
            `Failed to upload chunk ${i + 1}/${totalChunks} after ${MAX_CHUNK_RETRIES} retries. Upload ID: ${uploadId}`
          );
        }
      }
    }

    if (success) {
      const percent = Math.round(((i + 1) / totalChunks) * 100);
      callbacks?.onProgress?.(percent);
    }
  }

  // Complete upload — merge chunks on server
  const res = await completeChunkedUpload(uploadId);
  return res.data;
}

/**
 * Cancel a chunked upload and clean up temp files on server.
 */
export async function cancelUpload(uploadId: string): Promise<void> {
  await cancelChunkedUpload(uploadId);
}

async function initUpload(file: File): Promise<string> {
  const res = await initChunkedUpload({
    fileName: file.name,
    fileSize: file.size,
    totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    chunkSize: CHUNK_SIZE,
    mimeType: file.type || 'application/octet-stream',
  });
  return res.data.uploadId;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
