import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  productReviewApi,
  type CreateReviewRequest,
  type PaginatedReviewsResponse,
  type Review,
  type ReviewStats,
} from '@/features/product/api/productReviewApi';

interface FetchProductReviewsArgs {
  productId: number;
  page?: number;
  pageSize?: number;
  force?: boolean;
}

interface ProductReviewThunkState {
  productDetail: {
    reviewsLoading: boolean;
    reviewsLoaded: boolean;
    reviewsProductId: number | null;
    reviewsPagination: {
      currentPage: number;
      pageSize: number;
    };
  };
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  return error instanceof Error
    ? error.message
    : fallback;
}

export const fetchProductReviews = createAsyncThunk<
  PaginatedReviewsResponse,
  FetchProductReviewsArgs,
  {
    state: ProductReviewThunkState;
    rejectValue: string;
  }
>(
  'product/fetchReviews',
  async (
    {
      productId,
      page = 1,
      pageSize = 10,
    },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await productReviewApi.getProductReviews(
          productId,
          page,
          pageSize,
        );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت نظرات',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
  {
    condition: (
      {
        productId,
        page = 1,
        pageSize = 10,
        force = false,
      },
      { getState },
    ) => {
      if (force) {
        return true;
      }

      const state = getState().productDetail;
      const isSameProduct =
        state.reviewsProductId === productId;
      const isSamePage =
        state.reviewsPagination.currentPage === page &&
        state.reviewsPagination.pageSize === pageSize;

      if (
        state.reviewsLoading &&
        isSameProduct
      ) {
        return false;
      }

      if (
        state.reviewsLoaded &&
        isSameProduct &&
        isSamePage
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchMyReviews = createAsyncThunk<
  PaginatedReviewsResponse,
  {
    page?: number;
    pageSize?: number;
  },
  {
    rejectValue: string;
  }
>(
  'product/fetchMyReviews',
  async (
    {
      page = 1,
      pageSize = 10,
    },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await productReviewApi.getMyReviews(
          page,
          pageSize,
        );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت نظرات',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const fetchMyReviewStats = createAsyncThunk<
  ReviewStats,
  void,
  {
    rejectValue: string;
  }
>(
  'product/fetchMyReviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await productReviewApi.getMyReviewStats();

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت آمار',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const createReview = createAsyncThunk<
  Review,
  CreateReviewRequest,
  {
    state: ProductReviewThunkState;
    rejectValue: string;
  }
>(
  'product/createReview',
  async (
    data,
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await productReviewApi.createReview(data);

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در ثبت نظر',
        );
      }

      await dispatch(
        fetchProductReviews({
          productId: data.productId,
          force: true,
        }),
      ).unwrap();

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const markReviewHelpful = createAsyncThunk<
  {
    reviewId: number;
  },
  {
    reviewId: number;
  },
  {
    rejectValue: string;
  }
>(
  'product/markHelpful',
  async (
    { reviewId },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await productReviewApi.markHelpful(
          reviewId,
        );

      if (response.data.isSuccess) {
        return { reviewId };
      }

      return rejectWithValue(
        response.data.message ||
          'ثبت رأی مفید ناموفق بود.',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const deleteReview = createAsyncThunk<
  {
    reviewId: number;
  },
  {
    reviewId: number;
    productId: number;
  },
  {
    state: ProductReviewThunkState;
    rejectValue: string;
  }
>(
  'product/deleteReview',
  async (
    {
      reviewId,
      productId,
    },
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await productReviewApi.deleteReview(
          reviewId,
        );

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در حذف نظر',
        );
      }

      await dispatch(
        fetchProductReviews({
          productId,
          force: true,
        }),
      ).unwrap();

      return { reviewId };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const updateReview = createAsyncThunk<
  Review,
  {
    reviewId: number;
    data: Partial<CreateReviewRequest>;
    productId: number;
  },
  {
    state: ProductReviewThunkState;
    rejectValue: string;
  }
>(
  'product/updateReview',
  async (
    {
      reviewId,
      data,
      productId,
    },
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await productReviewApi.updateReview(
          reviewId,
          data,
        );

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در ویرایش نظر',
        );
      }

      await dispatch(
        fetchProductReviews({
          productId,
          force: true,
        }),
      ).unwrap();

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);

export const reportReview = createAsyncThunk<
  {
    reviewId: number;
  },
  {
    reviewId: number;
    reason: string;
  },
  {
    rejectValue: string;
  }
>(
  'product/reportReview',
  async (
    {
      reviewId,
      reason,
    },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await productReviewApi.reportReview(
          reviewId,
          reason,
        );

      if (response.data.isSuccess) {
        return { reviewId };
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در گزارش نظر',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطای شبکه'),
      );
    }
  },
);
