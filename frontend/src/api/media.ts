import request from './request';
import type { ApiResult, PageResult, MediaFile } from '@/types';

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<ApiResult<MediaFile>>('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

export const listMediaFiles = (page: number = 0, size: number = 20) =>
  request.get<ApiResult<PageResult<MediaFile>>>('/admin/media', { params: { page, size } }).then(res => res.data);

export const deleteMediaFile = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/media/${id}`).then(res => res.data);
