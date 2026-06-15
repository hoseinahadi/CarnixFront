// store/feature/product/productFilterSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/models/product/Product';
import { productFilterApi, ProductFilterParams } from '@/services/api/product/productFilterApi';

export const fetchFilteredProducts = createAsyncThunk(
  'productFilter/fetchFiltered',
  async (params: ProductFilterParams, { rejectWithValue }) => {
    try {
      const response = await productFilterApi.getFilteredProducts(params);
      if (response.data.isSuccess) {
        const data = response.data.mainResults || response.data.data;
        return data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت محصولات');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

interface ProductFilterState {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  activeFilters: ProductFilterParams;
}

const initialState: ProductFilterState = {
  products: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  loading: false,
  error: null,
  activeFilters: { 
    sortBy: 'newest', 
    page: 1, 
    pageSize: 20,
    vehicleIds: [] // ✅ اضافه شد
  },
};

const productFilterSlice = createSlice({
  name: 'productFilter',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilterParams>) => {
      state.activeFilters = { 
        ...state.activeFilters, 
        ...action.payload,
        page: 1 
      };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.activeFilters.page = action.payload;
    },
    clearFilters: (state) => {
      state.activeFilters = { 
        sortBy: 'newest', 
        page: 1, 
        pageSize: 20,
        vehicleIds: [] // ✅ اضافه شد
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.items || action.payload?.data || [];
        state.totalCount = action.payload?.totalCount || 0;
        state.currentPage = action.payload?.currentPage || action.payload?.pageNumber || 1;
        state.pageSize = action.payload?.pageSize || 20;
        state.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchFilteredProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearFilters, clearError } = productFilterSlice.actions;
export default productFilterSlice.reducer;