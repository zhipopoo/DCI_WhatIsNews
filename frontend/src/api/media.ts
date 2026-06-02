import request from './request';
import type { ApiResult, PageResult, MediaFile, InitChunkedUploadRequest, ChunkedUploadStatus } from '@/types';

// ---- Single-file upload ----

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<ApiResult<MediaFile>>('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

// ---- Chunked upload ----

/** Initialize a chunked upload session */
export const initChunkedUpload = (data: InitChunkedUploadRequest) =>
  request.post<ApiResult<{ uploadId: string }>>('/admin/media/upload/init', data).then(res => res.data);

/** Upload a single chunk */
export const uploadChunk = (uploadId: string, chunkIndex: number, chunk: Blob) => {
  const formData = new FormData();
  formData.append('uploadId', uploadId);
  formData.append('chunkIndex', String(chunkIndex));
  formData.append('file', chunk);
  return request.post<ApiResult<{ uploadId: string; chunkIndex: number; received: boolean }>>(
    '/admin/media/upload/chunk', formData, { headers: { 'Content-Type': 'multipart/form-data' } }
  ).then(res => res.data);
};

/** Complete the chunked upload: merge chunks and create media record */
export const completeChunkedUpload = (uploadId: string) =>
  request.post<ApiResult<MediaFile>>('/admin/media/upload/complete', { uploadId }).then(res => res.data);

/** Get chunked upload status (for resuming) */
export const getChunkedUploadStatus = (uploadId: string) =>
  request.get<ApiResult<ChunkedUploadStatus>>(`/admin/media/upload/status/${uploadId}`).then(res => res.data);

/** Cancel a chunked upload and clean up temp files */
export const cancelChunkedUpload = (uploadId: string) =>
  request.delete<ApiResult<void>>(`/admin/media/upload/cancel/${uploadId}`).then(res => res.data);

// ---- Media CRUD ----

export const listMediaFiles = (page: number = 0, size: number = 20) =>
  request.get<ApiResult<PageResult<MediaFile>>>('/admin/media', { params: { page, size } }).then(res => res.data);

export const deleteMediaFile = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/media/${id}`).then(res => res.data);

export const getMediaReferences = (id: number) =>
  request.get<ApiResult<{ id: number; title: string }[]>>(`/admin/media/${id}/references`).then(res => res.data);
