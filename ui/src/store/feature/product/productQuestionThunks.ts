import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  productQuestionApi,
  type CreateQuestionRequest,
  type ProductQuestion,
  type ProductQuestionsPage,
} from '@/features/product/api/productQuestionApi';

interface FetchProductQuestionsArgs {
  productId: number;
  page?: number;
  pageSize?: number;
  force?: boolean;
}

interface ProductQuestionThunkState {
  productDetail: {
    questionsLoading: boolean;
    questionsLoaded: boolean;
    questionsProductId: number | null;
    questionsPagination: {
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

export const fetchProductQuestions = createAsyncThunk<
  ProductQuestionsPage,
  FetchProductQuestionsArgs,
  {
    state: ProductQuestionThunkState;
    rejectValue: string;
  }
>(
  'product/fetchQuestions',
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
        await productQuestionApi.getProductQuestions(
          productId,
          page,
          pageSize,
        );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت پرسش‌ها',
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
        state.questionsProductId === productId;
      const isSamePage =
        state.questionsPagination.currentPage === page &&
        state.questionsPagination.pageSize === pageSize;

      if (
        state.questionsLoading &&
        isSameProduct
      ) {
        return false;
      }

      if (
        state.questionsLoaded &&
        isSameProduct &&
        isSamePage
      ) {
        return false;
      }

      return true;
    },
  },
);

export const createQuestion = createAsyncThunk<
  ProductQuestion,
  CreateQuestionRequest,
  {
    state: ProductQuestionThunkState;
    rejectValue: string;
  }
>(
  'product/createQuestion',
  async (
    data,
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await productQuestionApi.createQuestion(
          data,
        );

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در ثبت پرسش',
        );
      }

      await dispatch(
        fetchProductQuestions({
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
