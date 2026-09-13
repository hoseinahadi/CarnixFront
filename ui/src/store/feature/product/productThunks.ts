import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductFilters } from '@/models/product/ProductFilters';
import type { Product } from '@/models/product/Product';
import type { ProductDetails } from '@/models/product/ProductDetails';
import type { PagedResult } from '@/models/common/PagedResult';
import type { ProductBundleDto } from '@/models/ProductBundle/ProductBundle';
import { ProductApi } from '@/services/api/product/productApi';
import {
  getApiErrorMessage,
  unwrapApiData,
} from '@/services/api/common/apiError';

interface ProductHomeThunkState {
  product: {
    bestSellers: unknown;
    bestSellersLoading: boolean;
    featuredProducts: unknown;
    featuredLoading: boolean;
    discountedProducts: unknown;
    discountedLoading: boolean;
    newestProducts: unknown;
    newestLoading: boolean;
  };
}

const getCollectionSize = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== 'object') return 0;
  const record = value as Record<string, unknown>;
  const candidates = [record.mainResults, record.data, record.items];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.length;
    if (candidate && typeof candidate === 'object' && Array.isArray((candidate as { items?: unknown }).items)) {
      return (candidate as { items: unknown[] }).items.length;
    }
  }
  return 0;
};


const rejectApiError = (error: unknown, fallback: string): string =>
  getApiErrorMessage(error, fallback);

const readApiData = <T>(payload: unknown): T =>
  unwrapApiData<T>(payload);

export const getAllProducts = createAsyncThunk<
  PagedResult<Product>,
  ProductFilters | undefined,
  { rejectValue: string }
>(
  'product/getAll',
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getAll(filters);
      return readApiData<PagedResult<Product>>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت محصولات'));
    }
  }
);

interface GetBestSellersArgs {
  pageNumber?: number;
  pageSize?: number;
  includeAll?: boolean;
  force?: boolean;
}

export const getBestSellingProducts = createAsyncThunk<
  PagedResult<Product>,
  GetBestSellersArgs,
  { state: ProductHomeThunkState; rejectValue: string }
>(
  'product/getBestSellers',
  async (args, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5, includeAll = true } = args;
      const response = await ProductApi.getBestSellers(pageNumber, pageSize, includeAll);
      return readApiData<PagedResult<Product>>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت پرفروش‌ترین‌ها'));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().product;
      if (state.bestSellersLoading) return false;
      if (args.force) return true;
      return getCollectionSize(state.bestSellers) < (args.pageSize ?? 5);
    },
  },
);

interface GetPagedArgs {
  pageNumber?: number;
  pageSize?: number;
  force?: boolean;
}

export const getNewestProductsPaged = createAsyncThunk<PagedResult<Product>, GetPagedArgs, { state: ProductHomeThunkState; rejectValue: string }>(
  'product/getNewestPaged',
  async (args, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getFiltered({ sortBy: 'newest', page: pageNumber, pageSize });
      return readApiData<PagedResult<Product>>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت جدیدترین محصولات'));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().product;
      if (state.newestLoading) return false;
      if (args.force) return true;
      return getCollectionSize(state.newestProducts) < (args.pageSize ?? 5);
    },
  },
);

export const getFeaturedProductsPaged = createAsyncThunk<PagedResult<Product>, GetPagedArgs, { state: ProductHomeThunkState; rejectValue: string }>(
  'product/getFeaturedPaged',
  async (args, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getFeaturedPaged(pageNumber, pageSize);
      return readApiData<PagedResult<Product>>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت محصولات ویژه'));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().product;
      if (state.featuredLoading) return false;
      if (args.force) return true;
      return getCollectionSize(state.featuredProducts) < (args.pageSize ?? 5);
    },
  },
);

export const getDiscountedProductsPaged = createAsyncThunk<PagedResult<Product>, GetPagedArgs, { state: ProductHomeThunkState; rejectValue: string }>(
  'product/getDiscountedPaged',
  async (args, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getDiscountedPaged(pageNumber, pageSize);
      return readApiData<PagedResult<Product>>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت محصولات تخفیف‌دار'));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().product;
      if (state.discountedLoading) return false;
      if (args.force) return true;
      return getCollectionSize(state.discountedProducts) < (args.pageSize ?? 5);
    },
  },
);

export const getProductDetails = createAsyncThunk<
  ProductDetails,
  number | string,
  { rejectValue: string }
>(
  'product/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getDetails(id);
      return readApiData<ProductDetails>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت جزئیات محصول'));
    }
  }
);

// src/store/feature/product/productThunks.ts
export const getProductBySlug = createAsyncThunk<
  ProductDetails,
  string,
  { rejectValue: string }
>(
  'product/getBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getBySlug(slug);
      return readApiData<ProductDetails>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(rejectApiError(error, 'خطا در دریافت اطلاعات محصول'));
    }
  }
);

interface ProductPdpThunkState {
  productDetail: {
    currentProductId: number | null;
    effectivePriceLoading: boolean;
    effectivePriceLoaded: boolean;
    effectivePriceProductId: number | null;
    bundlesLoading: boolean;
    bundlesLoaded: boolean;
    bundlesProductId: number | null;
  };
}

export const fetchEffectivePrice = createAsyncThunk<
  number | null,
  {
    productId: number;
    force?: boolean;
  },
  {
    state: ProductPdpThunkState;
    rejectValue: string;
  }
>(
  'product/fetchEffectivePrice',
  async (
    { productId },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await ProductApi.getEffectivePrice(
          productId,
        );

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت قیمت محصول',
        );
      }

      return (
        response.data.data ??
        (response.data as { mainResults?: number })
          .mainResults ??
        null
      );
    } catch (error: unknown) {
      return rejectWithValue(
        rejectApiError(error, 'خطا در دریافت قیمت محصول'),
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
        state.currentProductId !== productId
      ) {
        return false;
      }

      if (
        state.effectivePriceLoading &&
        state.effectivePriceProductId === productId
      ) {
        return false;
      }

      if (
        state.effectivePriceLoaded &&
        state.effectivePriceProductId === productId
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchProductBundles = createAsyncThunk<
  import('@/models/ProductBundle/ProductBundle').ProductBundleDto[],
  {
    productId: number;
    force?: boolean;
  },
  {
    state: ProductPdpThunkState;
    rejectValue: string;
  }
>(
  'product/fetchProductBundles',
  async (
    { productId },
    { rejectWithValue },
  ) => {
    try {
      const response = await ProductApi.getBundlesByProduct(productId);

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت بسته‌های محصول',
        );
      }

      const allBundles = readApiData<ProductBundleDto[]>(
        response.data,
      );

      if (!Array.isArray(allBundles)) {
        return [];
      }

      return allBundles.filter((bundle) => bundle.items?.some((item) => item.productId === productId));
    } catch (error: unknown) {
      return rejectWithValue(
        rejectApiError(error, 'خطا در دریافت بسته‌های محصول'),
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
        state.currentProductId !== productId
      ) {
        return false;
      }

      if (
        state.bundlesLoading &&
        state.bundlesProductId === productId
      ) {
        return false;
      }

      if (
        state.bundlesLoaded &&
        state.bundlesProductId === productId
      ) {
        return false;
      }

      return true;
    },
  },
);
