// features/content/ContentManagerApi.ts

import axiosInstance from '@/services/api/common/axiosInstance';
import { OperationResult } from '@/models/common/OperationResult';

export interface CreateFullContentDto {
  title: string;
  slug: string;
  contentTypeId: number;
  initialBody: string;
  // فیلدهای زیر اختیاری هستند (بر اساس کدهای قبلی)
  categoryId?: number;
  seoTitle?: string;
  metaDescription?: string;
  blocks?: ContentBlockDto[];
}

export interface ContentBlockDto {
  blockType: string; // Text, Image, Video, ...
  contentData: string; // JSON or text
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
  body: string; // متن آخرین نسخه منتشر شده
  seoTitle: string;
  metaDescription: string;
  blocks: ContentBlockDto[]; // لیست بلوک‌ها مرتب شده بر اساس SortOrder
}

// === این اینترفیس جدید برای لیست مقالات صفحه اصلی اضافه شد ===
export interface ContentSummaryDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
}
// =============================================================

// --------------------------------------------------------
// Content Manager API Client
// --------------------------------------------------------

export const ContentManagerApi = {
  /**
   * ایجاد یکپارچه محتوای جدید به همراه نسخه، بلوک‌ها و سئو
   */
  createFullContent: async (data: CreateFullContentDto) =>
    await axiosInstance.post<OperationResult<number>>(
      '/ContentManager/CreateFullContent', 
      data
    ),

  /**
   * ایجاد یک نسخه جدید برای محتوای موجود
   * @param id شناسه محتوای اصلی
   * @param data اطلاعات نسخه جدید شامل متن و یادداشت تغییرات
   */
  createNewVersion: async (id: number, data: CreateVersionRequestDto) =>
    await axiosInstance.post<OperationResult<number>>(
      `/ContentManager/${id}/versions`, 
      data
    ),

  /**
   * انتشار محتوا (تغییر وضعیت به Published)
   * @param id شناسه محتوا
   */
  publishContent: async (id: number) =>
    await axiosInstance.patch<OperationResult<boolean>>(
      `/ContentManager/${id}/publish`
    ),

  /**
   * دریافت محتوای کامل برای نمایش در فرانت‌اند سایت (بر اساس آدرس/Slug)
   * @param slug آدرس یکتای سئو
   */
  getContentForDisplay: async (slug: string) =>
    await axiosInstance.get<OperationResult<FullContentDisplayDto>>(
      `/ContentManager/display/${slug}`
    ),

  // === این متد جدید برای دریافت لیست مقالات در صفحه اصلی اضافه شد ===
  /**
   * دریافت لیست جدیدترین مقالات/محتواها برای صفحه اصلی
   * @param count تعداد محتوای درخواستی (پیش‌فرض 3)
   */
  getLatestContents: async (count: number = 3) =>
    await axiosInstance.get<OperationResult<ContentSummaryDto[]>>(
      `/ContentManager/latest?count=${count}`
    ),
  // =================================================================
};
