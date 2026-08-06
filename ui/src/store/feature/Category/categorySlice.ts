
import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  Category,
} from '@/models/category/Category';

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  searchCategories,
  updateCategory,
} from './categoryThunks';

export type CategoryFetchStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface CategoryState {
  categories: Category[];

  fetchStatus: CategoryFetchStatus;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],

  fetchStatus: 'idle',
  loading: false,
  error: null,
  successMessage: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,

  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    /*
     * Retry دریافت لیست باید صریح باشد.
     * Effectهای صفحه این Action را خودکار اجرا نمی‌کنند.
     */
    resetCategoryFetch: (state) => {
      if (
        state.fetchStatus !== 'loading'
      ) {
        state.fetchStatus = 'idle';
        state.error = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchCategories.pending,
        (state) => {
          state.fetchStatus = 'loading';
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchCategories.fulfilled,
        (
          state,
          action: PayloadAction<Category[]>,
        ) => {
          state.fetchStatus = 'succeeded';
          state.loading = false;
          state.categories = action.payload;
        },
      )
      .addCase(
        fetchCategories.rejected,
        (state, action) => {
          state.fetchStatus = 'failed';
          state.loading = false;
          state.error =
            action.payload ??
            'خطا در دریافت دسته‌بندی‌ها';
        },
      );

    builder
      .addCase(
        searchCategories.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        searchCategories.fulfilled,
        (
          state,
          action: PayloadAction<Category[]>,
        ) => {
          state.loading = false;
          state.categories = action.payload;
        },
      )
      .addCase(
        searchCategories.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'خطا در جستجوی دسته‌بندی';
        },
      );

    builder
      .addCase(
        createCategory.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        createCategory.fulfilled,
        (
          state,
          action: PayloadAction<Category>,
        ) => {
          state.loading = false;
          state.successMessage =
            'دسته‌بندی با موفقیت ایجاد شد';

          state.categories.push(
            action.payload,
          );
        },
      )
      .addCase(
        createCategory.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'خطا در ایجاد دسته‌بندی';
        },
      );

    builder
      .addCase(
        updateCategory.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        updateCategory.fulfilled,
        (
          state,
          action: PayloadAction<Category>,
        ) => {
          state.loading = false;
          state.successMessage =
            'دسته‌بندی با موفقیت ویرایش شد';

          const index =
            state.categories.findIndex(
              (category) =>
                category.categoryId ===
                action.payload.categoryId,
            );

          if (index >= 0) {
            state.categories[index] =
              action.payload;
          }
        },
      )
      .addCase(
        updateCategory.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'خطا در ویرایش دسته‌بندی';
        },
      );

    builder
      .addCase(
        deleteCategory.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        deleteCategory.fulfilled,
        (
          state,
          action: PayloadAction<number>,
        ) => {
          state.loading = false;
          state.successMessage =
            'دسته‌بندی با موفقیت حذف شد';

          state.categories =
            state.categories.filter(
              (category) =>
                category.categoryId !==
                action.payload,
            );
        },
      )
      .addCase(
        deleteCategory.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'خطا در حذف دسته‌بندی';
        },
      );
  },
});

export const {
  clearCategoryMessages,
  resetCategoryFetch,
} = categorySlice.actions;

export default categorySlice.reducer;
