import request from './request';
import type { ApiResult, PageResult, NewsItem, NewsFormData } from '@/types';

/** Public: get published news detail */
export const getPublishedNews = (id: number) =>
  request.get<ApiResult<NewsItem>>(`/news/${id}`).then(res => res.data);

/** Public: list published news */
export const listPublishedNews = (params: {
  categoryId?: number;
  page?: number;
  size?: number;
}) =>
  request.get<ApiResult<PageResult<NewsItem>>>('/news', { params }).then(res => res.data);

/** Public: search published news */
export const searchNews = (params: { keyword: string; page?: number; size?: number }) =>
  request.get<ApiResult<PageResult<NewsItem>>>('/news/search', { params }).then(res => res.data);

/** Public: get top news */
export const getTopNews = (limit: number = 5) =>
  request.get<ApiResult<NewsItem[]>>('/news/featured/top', { params: { limit } }).then(res => res.data);

/** Public: get latest news */
export const getLatestNews = (limit: number = 6) =>
  request.get<ApiResult<NewsItem[]>>('/news/featured/latest', { params: { limit } }).then(res => res.data);

// --- Admin ---

export const listAllNews = (page: number = 0, size: number = 20) =>
  request.get<ApiResult<PageResult<NewsItem>>>('/admin/news', { params: { page, size } }).then(res => res.data);

export const getNewsById = (id: number) =>
  request.get<ApiResult<NewsItem>>(`/admin/news/${id}`).then(res => res.data);

export const createNews = (data: NewsFormData) =>
  request.post<ApiResult<NewsItem>>('/admin/news', data).then(res => res.data);

export const updateNews = (id: number, data: NewsFormData) =>
  request.put<ApiResult<NewsItem>>(`/admin/news/${id}`, data).then(res => res.data);

export const deleteNews = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/news/${id}`).then(res => res.data);

export const togglePublish = (id: number) =>
  request.patch<ApiResult<void>>(`/admin/news/${id}/publish`).then(res => res.data);

export const toggleTop = (id: number) =>
  request.patch<ApiResult<void>>(`/admin/news/${id}/top`).then(res => res.data);
