// ==================== API Response Types ====================

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ==================== News ====================

export interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  coverImage?: string;
  categoryId: number;
  categoryName?: string;
  tags?: string;
  author: string;
  isPublished: boolean;
  isTop: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  prevNews?: NewsNav;
  nextNews?: NewsNav;
}

export interface NewsNav {
  id: number;
  title: string;
}

export interface NewsFormData {
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  coverImage?: string;
  categoryId: number;
  tags?: string;
  author?: string;
  isPublished?: boolean;
  isTop?: boolean;
}

// ==================== Category ====================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  newsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

// ==================== Auth ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  displayName: string;
}

// ==================== Admin User ====================

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  displayName?: string;
  email?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ==================== Media ====================

export interface MediaFile {
  id: number;
  originalName: string;
  storedName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  width?: number;
  height?: number;
  createdAt: string;
  referencingArticles?: { id: number; title: string }[];
}

// ==================== Chunked Upload ====================

export interface InitChunkedUploadRequest {
  fileName: string;
  fileSize: number;
  totalChunks: number;
  chunkSize: number;
  mimeType: string;
}

export interface ChunkedUploadStatus {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  chunkSize: number;
  status: string;
  uploadedChunks: number[];
  createdAt: string;
}
