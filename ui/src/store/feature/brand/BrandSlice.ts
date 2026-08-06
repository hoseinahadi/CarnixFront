
import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { Brand } from '@/models/brand/Brand';

import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
} from './BrandThunks';

export type BrandListStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface BrandState {
  brands: Brand[];
  selectedBrand: Brand | null;

  listStatus: BrandListStatus;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: BrandState = {
  brands: [],
  selectedBrand: null,

  listStatus: 'idle',
  loading: false,
  actionLoading: false,
  error: null,
};

const brandSlice = createSlice({
  name: 'brands',
  initialState,

  reducers: {
    setSelectedBrand: (
      state,
      action: PayloadAction<Brand | null>,
    ) => {
      state.selectedBrand = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    /*
     * Retry فقط باید با اقدام صریح کاربر انجام شود.
     * کامپوننت‌های عمومی این Action را خودکار Dispatch نمی‌کنند.
     */
    resetBrandsRequest: (state) => {
      if (state.listStatus !== 'loading') {
        state.listStatus = 'idle';
        state.error = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllBrands.pending, (state) => {
        state.listStatus = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBrands.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(getAllBrands.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.loading = false;
        state.error =
          action.payload ??
          'خطا در دریافت برندها';
      });

    builder
      .addCase(getBrandById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrandById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBrand = action.payload;
      })
      .addCase(getBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          'خطا در دریافت برند';
      });

    builder
      .addCase(createBrand.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.actionLoading = false;

        if (action.payload) {
          state.brands.push(action.payload);
        }
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload ??
          'خطا در ایجاد برند';
      });

    builder
      .addCase(updateBrand.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updatedBrand = action.payload;

        if (!updatedBrand) {
          return;
        }

        const index = state.brands.findIndex(
          (brand) =>
            brand.brandId === updatedBrand.brandId,
        );

        if (index >= 0) {
          state.brands[index] = updatedBrand;
        }
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload ??
          'خطا در ویرایش برند';
      });

    builder
      .addCase(deleteBrand.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.brands = state.brands.filter(
          (brand) =>
            brand.brandId !== action.payload,
        );
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload ??
          'خطا در حذف برند';
      });
  },
});

export const {
  setSelectedBrand,
  clearError,
  resetBrandsRequest,
} = brandSlice.actions;

export default brandSlice.reducer;
