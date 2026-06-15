import { createAsyncThunk } from '@reduxjs/toolkit';
import { productReviewApi, CreateReviewRequest } from '@/features/product/api/productReviewApi';

// دریافت نظرات محصول
export const fetchProductReviews = createAsyncThunk(
  'product/fetchReviews',
  async ({ productId, page = 1, pageSize = 10 }: { productId: number; page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await productReviewApi.getProductReviews(productId, page, pageSize);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت نظرات');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// ثبت نظر جدید
export const createReview = createAsyncThunk(
  'product/createReview',
  async (data: CreateReviewRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await productReviewApi.createReview(data);
      if (response.data.isSuccess) {
        // بعد از ثبت موفق، نظرات رو رفرش کن
        dispatch(fetchProductReviews({ productId: data.productId }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در ثبت نظر');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// رأی مفید
export const markReviewHelpful = createAsyncThunk(
  'product/markHelpful',
  async ({ reviewId, productId }: { reviewId: number; productId: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await productReviewApi.markHelpful(reviewId);
      if (response.data.isSuccess) {
        dispatch(fetchProductReviews({ productId }));
        return { reviewId };
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);