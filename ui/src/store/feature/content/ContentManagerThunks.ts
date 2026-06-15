// features/content/store/ContentManagerThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContentManagerApi } from '@/features/content/api/ContentManagerApi';
import type { 
  CreateFullContentDto, 
  CreateVersionRequestDto 
} from '@/features/content/api/ContentManagerApi'; 

// ایجاد محتوای جدید
export const createFullContent = createAsyncThunk(
  'contentManager/createFullContent',
  async (data: CreateFullContentDto, { rejectWithValue }) => {
    try {
      const response = await ContentManagerApi.createFullContent(data);
      if (response.data.isSuccess) {
        return response.data.data; 
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد محتوا');
    }
  }
);

// ایجاد نسخه جدید برای محتوا
export const createNewVersion = createAsyncThunk(
  'contentManager/createNewVersion',
  async ({ id, data }: { id: number; data: CreateVersionRequestDto }, { rejectWithValue }) => {
    try {
      const response = await ContentManagerApi.createNewVersion(id, data);
      if (response.data.isSuccess) {
        return response.data.data; 
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد نسخه جدید');
    }
  }
);

// انتشار محتوا
export const publishContent = createAsyncThunk(
  'contentManager/publishContent',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await ContentManagerApi.publishContent(id);
      if (response.data.isSuccess) {
        return id; 
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در انتشار محتوا');
    }
  }
);

// دریافت محتوا برای نمایش در سایت (بر اساس slug)
export const getContentForDisplay = createAsyncThunk(
  'contentManager/getContentForDisplay',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await ContentManagerApi.getContentForDisplay(slug);
      if (response.data.isSuccess) {
        return response.data.data; 
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اطلاعات محتوا');
    }
  }
);

// === اضافه شدن Thunk جدید برای دریافت جدیدترین مقالات ===
export const getLatestContents = createAsyncThunk(
  'contentManager/getLatestContents',
  async (count: number = 3, { rejectWithValue }) => {
    try {
      const response = await ContentManagerApi.getLatestContents(count);
      if (response.data.isSuccess) {
        return response.data.data; // آرایه‌ای از ContentSummaryDto
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جدیدترین مقالات');
    }
  }
);
// ========================================================
