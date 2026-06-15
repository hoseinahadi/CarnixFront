import { createAsyncThunk } from '@reduxjs/toolkit';
import { productQuestionApi, CreateQuestionRequest } from '@/features/product/api/productQuestionApi';

// دریافت پرسش‌های محصول
export const fetchProductQuestions = createAsyncThunk(
  'product/fetchQuestions',
  async ({ productId, page = 1, pageSize = 10 }: { productId: number; page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await productQuestionApi.getProductQuestions(productId, page, pageSize);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت پرسش‌ها');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// ثبت پرسش جدید
export const createQuestion = createAsyncThunk(
  'product/createQuestion',
  async (data: CreateQuestionRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await productQuestionApi.createQuestion(data);
      if (response.data.isSuccess) {
        dispatch(fetchProductQuestions({ productId: data.productId }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در ثبت پرسش');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);