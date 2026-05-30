import request from './request';
import type { ApiResult, Category, CategoryFormData } from '@/types';

export const getAllCategories = () =>
  request.get<ApiResult<Category[]>>('/categories').then(res => res.data);

export const getCategoryBySlug = (slug: string) =>
  request.get<ApiResult<Category>>(`/categories/${slug}`).then(res => res.data);

// Admin
export const createCategory = (data: CategoryFormData) =>
  request.post<ApiResult<Category>>('/admin/categories', data).then(res => res.data);

export const updateCategory = (id: number, data: CategoryFormData) =>
  request.put<ApiResult<Category>>(`/admin/categories/${id}`, data).then(res => res.data);

export const deleteCategory = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/categories/${id}`).then(res => res.data);
