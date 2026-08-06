// features/content/ContentManagerApi.ts

import axiosClient from '@/services/api/common/axiosClient';
import { OperationResult } from '@/models/common/OperationResult';

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

  getContentForDisplay: async (slug: string) =>
    await axiosClient.get<OperationResult<FullContentDisplayDto>>(
      `/ContentManager/display/${slug}`
    ),

  getLatestContents: async (count: number = 3) =>
    await axiosClient.get<OperationResult<ContentSummaryDto[]>>(
      `/ContentManager/latest?count=${count}`
    ),

  // === متد جدید برای دریافت کلیه مقالات جهت ساخت صفحات استاتیک ===
  getAllContents: async () =>
    await axiosClient.get<OperationResult<ContentSummaryDto[]>>(
      '/ContentManager/all' // یا هر اندپوینتی که در بک‌اند ASP.NET برای لیست کل مقالات داری
    ),
};