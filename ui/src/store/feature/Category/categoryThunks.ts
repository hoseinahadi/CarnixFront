import { createAsyncThunk } from '@reduxjs/toolkit';

import { CategoryApi } from '@/features/category/api/routes';

import type { Category } from '@/models/category/Category';
import type { CreateCategoryDto } from '@/models/category/CreateCategoryDto';
import type { UpdateCategoryDto } from '@/models/category/UpdateCategoryDto';

type CategoryFetchStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface CategoryRootState {
  category: {
    fetchStatus?: CategoryFetchStatus;
  };
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const extractCategoryArray = (
  value: unknown,
): Category[] => {
  if (Array.isArray(value)) {
    return value as Category[];
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidates = [
    value.data,
    value.mainResults,
    value.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Category[];
    }

    if (
      isRecord(candidate) &&
      Array.isArray(candidate.items)
    ) {
      return candidate.items as Category[];
    }
  }

  return [];
};

const extractObject = <T>(value: unknown): T => {
  if (isRecord(value)) {
    return (value.data ?? value.mainResults ?? value) as T;
  }

  return value as T;
};

const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
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

  return fallbackMessage;
};

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  {
    state: CategoryRootState;
    rejectValue: string;
  }
>(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getMenu();

      if (response.data.isSuccess === false) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت دسته‌بندی‌ها',
        );
      }

      return extractCategoryArray(
        response.data.data ?? response.data,
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در دریافت لیست دسته‌بندی‌ها',
        ),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const status =
        getState().category.fetchStatus ??
        'idle';

      return status === 'idle';
    },
  },
);

// 🟢 Thunk جدید برای لود داینامیک زیردسته‌ها
export const fetchSubCategories = createAsyncThunk<
  { parentId: number; subCategories: Category[] },
  number,
  { rejectValue: string }
>(
  'category/fetchSubCategories',
  async (parentId, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getSubCategories(parentId);

      if (response.data.isSuccess === false) {
        return rejectWithValue(
          response.data.message || 'خطا در دریافت زیردسته‌ها'
        );
      }

      const subCats = extractCategoryArray(response.data.data ?? response.data);
      return { parentId, subCategories: subCats };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'خطا در دریافت زیردسته‌ها')
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk<
  Category,
  number,
  {
    rejectValue: string;
  }
>(
  'category/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.getById(id);
      return extractObject<Category>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در دریافت دسته‌بندی',
        ),
      );
    }
  },
);

export const searchCategories = createAsyncThunk<
  Category[],
  string,
  {
    rejectValue: string;
  }
>(
  'category/search',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.search(keyword);
      return extractCategoryArray(response.data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در جستجوی دسته‌بندی',
        ),
      );
    }
  },
);

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryDto,
  {
    rejectValue: string;
  }
>(
  'category/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await CategoryApi.create(payload);
      return extractObject<Category>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در ایجاد دسته‌بندی',
        ),
      );
    }
  },
);

export const updateCategory = createAsyncThunk<
  Category,
  {
    categoryId: number;
    payload: UpdateCategoryDto;
  },
  {
    rejectValue: string;
  }
>(
  'category/update',
  async (
    { categoryId, payload },
    { rejectWithValue },
  ) => {
    try {
      const response = await CategoryApi.update(
        categoryId,
        payload,
      );

      return extractObject<Category>(response.data);
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در ویرایش دسته‌بندی',
        ),
      );
    }
  },
);

export const deleteCategory = createAsyncThunk<
  number,
  number,
  {
    rejectValue: string;
  }
>(
  'category/delete',
  async (id, { rejectWithValue }) => {
    try {
      await CategoryApi.delete(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'خطا در حذف دسته‌بندی',
        ),
      );
    }
  },
);