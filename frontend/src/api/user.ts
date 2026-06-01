import request from './request';
import type { ApiResult, PageResult, AdminUser, CreateUserRequest, ChangePasswordRequest } from '@/types';

export const listUsers = (page: number = 0, size: number = 20) =>
  request.get<ApiResult<PageResult<AdminUser>>>('/admin/users', { params: { page, size } }).then(res => res.data);

export const getUserById = (id: number) =>
  request.get<ApiResult<AdminUser>>(`/admin/users/${id}`).then(res => res.data);

export const createUser = (data: CreateUserRequest) =>
  request.post<ApiResult<AdminUser>>('/admin/users', data).then(res => res.data);

export const updateUser = (id: number, data: CreateUserRequest) =>
  request.put<ApiResult<AdminUser>>(`/admin/users/${id}`, data).then(res => res.data);

export const deleteUser = (id: number) =>
  request.delete<ApiResult<void>>(`/admin/users/${id}`).then(res => res.data);

export const changeMyPassword = (data: ChangePasswordRequest) =>
  request.put<ApiResult<void>>('/admin/users/me/password', data).then(res => res.data);
