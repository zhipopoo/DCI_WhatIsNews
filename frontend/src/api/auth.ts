import request from './request';
import type { ApiResult, LoginRequest, LoginResponse } from '@/types';

export const login = (data: LoginRequest) =>
  request.post<ApiResult<LoginResponse>>('/auth/login', data).then(res => res.data);
