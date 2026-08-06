import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  productRelatedApi,
  type RelatedProductsResponse,
} from '@/features/product/api/productRelatedApi';

interface ProductRelatedThunkState {
  productDetail: {
    relatedLoading: boolean;
    relatedLoaded: boolean;
    relatedProductId: number | null;
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'خطای شبکه'
    );
  }

  return error instanceof Error
    ? error.message
    : 'خطای شبکه';
}

export const fetchRelatedProducts = createAsyncThunk<
  RelatedProductsResponse,
  {
    productId: number;
    force?: boolean;
  },
  {
    state: ProductRelatedThunkState;
    rejectValue: string;
  }
>(
  'product/fetchRelated',
  async (
    { productId },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await productRelatedApi.getRelatedProducts(
          productId,
        );

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت محصولات مرتبط',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
  {
    condition: (
      {
        productId,
        force = false,
      },
      { getState },
    ) => {
      if (force) {
        return true;
      }

      const state = getState().productDetail;

      if (
        state.relatedLoading &&
        state.relatedProductId === productId
      ) {
        return false;
      }

      if (
        state.relatedLoaded &&
        state.relatedProductId === productId
      ) {
        return false;
      }

      return true;
    },
  },
);
