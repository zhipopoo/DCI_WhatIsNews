import request from './request';
import type { ApiResult, UsefulLink, UsefulLinkFormData } from '@/types';

// Public
export const getActiveUsefulLinks = () =>
  request.get<ApiResult<UsefulLink[]>>('/useful-links').then(res => res.data);

// Admin
export const listAllUsefulLinks = () =>
  request.get<ApiResult<UsefulLink[]>>('/admin/useful-links').then(res => res.data);

export const createUsefulLink = (data: UsefulLinkFormData) =>
  request.post<ApiResult<UsefulLink>>('/admin/useful-links', data).then(res => res.data);

export const updateUsefulLink = (id: number, data: UsefulLinkFormData) =>
  request.put<ApiResult<UsefulLink>>(`/admin/useful-links/${id}`, data).then(res => res.data);

export const deleteUsefulLink = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/useful-links/${id}`).then(res => res.data);
