import { createAsyncThunk } from '@reduxjs/toolkit';
import { productRelatedApi } from '@/features/product/api/productRelatedApi';

// دریافت محصولات مرتبط
export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelated',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await productRelatedApi.getRelatedProducts(productId);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت محصولات مرتبط');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);