// features/content/ContentManagerApi.ts

import axiosClient from '@/services/api/common/axiosClient';
import { OperationResult } from '@/models/common/OperationResult';
import { getCachedRequest } from '@/services/api/common/requestCache';

export interface CreateFullContentDto {
  title: string;
  slug: string;
  contentTypeId: number;
  initialBody: string;
  categoryId?: number;
  seoTitle?: string;
  metaDescription?: string;
  blocks?: ContentBlockDto[];
}

export interface ContentBlockDto {
  blockType: string;
  contentData: string;
  sortOrder: number;
}

export interface CreateVersionRequestDto {
  newBody: string;
  changeNote: string;
}

export interface FullContentDisplayDto {
  contentId: number;
  title: string;
  slug: string;
  publishDate?: string | null;
  body: string;
  seoTitle: string;
  metaDescription: string;
  blocks: ContentBlockDto[];
}

export interface ContentSummaryDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
}

const CONTENT_CACHE_TTL_MS = 2 * 60_000;

export const ContentManagerApi = {
  createFullContent: async (data: CreateFullContentDto) =>
    await axiosClient.post<OperationResult<number>>(
      '/ContentManager/CreateFullContent', 
      data
    ),

  createNewVersion: async (id: number, data: CreateVersionRequestDto) =>
    await axiosClient.post<OperationResult<number>>(
      `/ContentManager/${id}/versions`, 
      data
    ),

  publishContent: async (id: number) =>
    await axiosClient.patch<OperationResult<boolean>>(
      `/ContentManager/${id}/publish`
    ),

  getContentForDisplay: (slug: string) =>
    getCachedRequest(
      `content:display:${slug}`,
      () => axiosClient.get<OperationResult<FullContentDisplayDto>>(
        `/ContentManager/display/${encodeURIComponent(slug)}`
      ),
      CONTENT_CACHE_TTL_MS,
    ),

  getLatestContents: (count: number = 3) =>
    getCachedRequest(
      `content:latest:${count}`,
      () => axiosClient.get<OperationResult<ContentSummaryDto[]>>(
        '/ContentManager/latest',
        { params: { count } },
      ),
      CONTENT_CACHE_TTL_MS,
    ),

  // === متد جدید برای دریافت کلیه مقالات جهت ساخت صفحات استاتیک ===
  getAllContents: () =>
    getCachedRequest(
      'content:all',
      () => axiosClient.get<OperationResult<ContentSummaryDto[]>>(
        '/ContentManager/all'
      ),
      CONTENT_CACHE_TTL_MS,
    ),
};