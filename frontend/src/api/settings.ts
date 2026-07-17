import request from './request';
import type { ApiResult, SiteSettings } from '@/types';

export const getSettings = () =>
  request.get<ApiResult<SiteSettings>>('/settings').then(res => res.data);

export const updateSettings = (data: SiteSettings) =>
  request.put<ApiResult<SiteSettings>>('/admin/settings', data).then(res => res.data);
