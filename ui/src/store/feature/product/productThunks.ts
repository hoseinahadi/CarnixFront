// مسیر: src/features/products/store/productThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductFilters } from '@/models/product/ProductFilters';
import { ProductApi } from '@/services/api/product/productApi';

// دریافت همه محصولات
export const getAllProducts = createAsyncThunk(
  'product/getAll',
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getAll(filters);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات');
    }
  }
);

// دریافت پرفروش‌ترین محصولات
interface GetBestSellersArgs {
  pageNumber?: number;
  pageSize?: number;
  includeAll?: boolean;
}

export const getBestSellingProducts = createAsyncThunk(
  'product/getBestSellers',
  async (args: GetBestSellersArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5, includeAll = false } = args;
      const response = await ProductApi.getBestSellers(pageNumber, pageSize, includeAll);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت پرفروش‌ترین‌ها');
    }
  }
);

// 🟢 دریافت محصولات ویژه (اضافه شده)
interface GetPagedArgs {
  pageNumber?: number;
  pageSize?: number;
}

export const getFeaturedProductsPaged = createAsyncThunk(
  'product/getFeaturedPaged',
  async (args: GetPagedArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getFeaturedPaged(pageNumber, pageSize);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات ویژه');
    }
  }
);

// 🟢 دریافت محصولات تخفیف‌دار (اضافه شده)
export const getDiscountedProductsPaged = createAsyncThunk(
  'product/getDiscountedPaged',
  async (args: GetPagedArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getDiscountedPaged(pageNumber, pageSize);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات تخفیف‌دار');
    }
  }
);

// دریافت جزئیات محصول با ID
export const getProductDetails = createAsyncThunk(
  'product/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getDetails(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات محصول');
    }
  }
);

// دریافت جزئیات محصول با Slug
export const getProductBySlug = createAsyncThunk(
  'product/getBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getBySlug(slug); 
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اطلاعات محصول');
    }
  }
);
