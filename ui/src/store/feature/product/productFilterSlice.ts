// store/feature/product/productFilterSlice.ts

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { Product } from '@/models/product/Product';

import {
  createProductFilterRequestKey,
  DEFAULT_FILTERS,
  normalizeProductFilters,
  type ProductFilterParams,
} from '@/models/product/ProductFilters';

import {
  productFilterApi,
  type ProductFilterApiEnvelope,
} from '@/services/api/product/productFilterApi';

interface ProductPageResult {
  items: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

interface ProductFilterState {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  activeFilters: ProductFilterParams;
  currentRequestId: string | null;
  currentRequestKey: string | null;
}

const initialState: ProductFilterState = {
  products: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  loading: false,
  error: null,
  activeFilters: { ...DEFAULT_FILTERS },
  currentRequestId: null,
  currentRequestKey: null,
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const readNumber = (
  source: Record<string, unknown>,
  keys: readonly string[],
  fallback: number,
): number => {
  for (const key of keys) {
    const value = source[key];
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const extractPayload = (
  envelope: ProductFilterApiEnvelope,
): unknown =>
  envelope.mainResults ??
  envelope.data ??
  envelope;

const normalizePageResult = (
  payload: unknown,
  requestedFilters: ProductFilterParams,
): ProductPageResult => {
  if (Array.isArray(payload)) {
    const products = payload as Product[];

    return {
      items: products,
      totalCount: products.length,
      currentPage: requestedFilters.page ?? 1,
      pageSize: requestedFilters.pageSize ?? 20,
      totalPages: products.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(payload)) {
    return {
      items: [],
      totalCount: 0,
      currentPage: requestedFilters.page ?? 1,
      pageSize: requestedFilters.pageSize ?? 20,
      totalPages: 0,
    };
  }

  const nestedData = isRecord(payload.data)
    ? payload.data
    : undefined;

  const itemsCandidate =
    payload.items ??
    nestedData?.items ??
    payload.products ??
    nestedData?.products;

  const items = Array.isArray(itemsCandidate)
    ? (itemsCandidate as Product[])
    : [];

  const pageSize = readNumber(
    payload,
    ['pageSize'],
    readNumber(
      nestedData ?? {},
      ['pageSize'],
      requestedFilters.pageSize ?? 20,
    ),
  );

  const totalCount = readNumber(
    payload,
    ['totalCount', 'totalItems'],
    readNumber(
      nestedData ?? {},
      ['totalCount', 'totalItems'],
      items.length,
    ),
  );

  const currentPage = readNumber(
    payload,
    ['currentPage', 'pageNumber', 'page'],
    readNumber(
      nestedData ?? {},
      ['currentPage', 'pageNumber', 'page'],
      requestedFilters.page ?? 1,
    ),
  );

  const calculatedTotalPages =
    pageSize > 0
      ? Math.ceil(totalCount / pageSize)
      : 0;

  const totalPages = readNumber(
    payload,
    ['totalPages'],
    readNumber(
      nestedData ?? {},
      ['totalPages'],
      calculatedTotalPages,
    ),
  );

  return {
    items,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
  };
};

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'خطا در دریافت محصولات';
};

export const fetchFilteredProducts = createAsyncThunk<
  ProductPageResult,
  ProductFilterParams,
  {
    rejectValue: string;
  }
>(
  'productFilter/fetchFiltered',
  async (
    sourceParams,
    {
      rejectWithValue,
      signal,
    },
  ) => {
    const params = normalizeProductFilters(sourceParams);

    try {
      const response =
        await productFilterApi.getFilteredProducts(
          params,
          signal,
        );

      if (response.data.isSuccess === false) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت محصولات',
        );
      }

      return normalizePageResult(
        extractPayload(response.data),
        params,
      );
    } catch (error: unknown) {
      if (signal.aborted) {
        throw error;
      }

      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

const productFilterSlice = createSlice({
  name: 'productFilter',
  initialState,
  reducers: {
    /**
     * فیلترها را دقیقاً با مقدار URL هماهنگ می‌کند.
     * برخلاف نسخه قبلی، شماره صفحه را خودکار روی ۱ نمی‌گذارد.
     */
    setFilters: (
      state,
      action: PayloadAction<ProductFilterParams>,
    ) => {
      state.activeFilters =
        normalizeProductFilters(action.payload);
    },

    setPage: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.activeFilters.page = Math.max(
        1,
        Math.floor(action.payload),
      );
    },

    clearFilters: (state) => {
      state.activeFilters = {
        ...DEFAULT_FILTERS,
      };
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchFilteredProducts.pending,
        (state, action) => {
          state.loading = true;
          state.error = null;
          state.currentRequestId =
            action.meta.requestId;
          state.currentRequestKey =
            createProductFilterRequestKey(
              action.meta.arg,
            );
        },
      )
      .addCase(
        fetchFilteredProducts.fulfilled,
        (state, action) => {
          /*
           * پاسخ قدیمی اجازه بازنویسی نتیجه فیلتر جدید را ندارد.
           */
          if (
            state.currentRequestId !==
            action.meta.requestId
          ) {
            return;
          }

          state.loading = false;
          state.products = action.payload.items;
          state.totalCount =
            action.payload.totalCount;
          state.currentPage =
            action.payload.currentPage;
          state.pageSize =
            action.payload.pageSize;
          state.totalPages =
            action.payload.totalPages;
          state.currentRequestId = null;
          state.currentRequestKey = null;
        },
      )
      .addCase(
        fetchFilteredProducts.rejected,
        (state, action) => {
          if (
            state.currentRequestId !==
            action.meta.requestId
          ) {
            return;
          }

          state.loading = false;
          state.currentRequestId = null;
          state.currentRequestKey = null;

          if (action.meta.aborted) {
            return;
          }

          state.error =
            action.payload ||
            action.error.message ||
            'خطا در دریافت محصولات';
        },
      );
  },
});

export const {
  setFilters,
  setPage,
  clearFilters,
  clearError,
} = productFilterSlice.actions;

export default productFilterSlice.reducer;
