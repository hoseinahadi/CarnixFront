
import { createAsyncThunk } from '@reduxjs/toolkit';

import { BrandApi } from '@/features/brand/api/routes';
import type { Brand } from '@/models/brand/Brand';

type RequestStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface BrandRootState {
  brand: {
    listStatus?: RequestStatus;
  };
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
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

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
};

const extractBrandArray = (
  value: unknown,
): Brand[] => {
  if (Array.isArray(value)) {
    return value as Brand[];
  }

  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return [];
  }

  const source =
    value as Record<string, unknown>;

  const candidates = [
    source.data,
    source.mainResults,
    source.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Brand[];
    }

    if (
      typeof candidate === 'object' &&
      candidate !== null &&
      Array.isArray(
        (
          candidate as Record<string, unknown>
        ).items,
      )
    ) {
      return (
        candidate as {
          items: Brand[];
        }
      ).items;
    }
  }

  return [];
};

const extractBrand = (
  value: unknown,
): Brand => {
  if (
    typeof value === 'object' &&
    value !== null
  ) {
    const source =
      value as Record<string, unknown>;

    return (
      source.data ??
      source.mainResults ??
      value
    ) as Brand;
  }

  return value as Brand;
};

export const getAllBrands =
  createAsyncThunk<
    Brand[],
    void,
    {
      state: BrandRootState;
      rejectValue: string;
    }
  >(
    'brand/getAll',

    async (
      _,
      {
        rejectWithValue,
      },
    ) => {
      try {
        const response =
          await BrandApi.getAll();

        if (
          response.data.isSuccess === false
        ) {
          return rejectWithValue(
            response.data.message ||
              'خطا در دریافت برندها',
          );
        }

        return extractBrandArray(
          response.data.data ??
            response.data,
        );
      } catch (
        error: unknown
      ) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در دریافت برندها',
          ),
        );
      }
    },

    {
      /*
       * نکته حیاتی:
       * بعد از failed دوباره خودکار درخواست نمی‌زنیم.
       * Retry فقط با resetBrandsRequest و اقدام صریح کاربر انجام می‌شود.
       */
      condition: (
        _,
        {
          getState,
        },
      ) => {
        const status =
          getState().brand.listStatus ??
          'idle';

        return status === 'idle';
      },
    },
  );

export const getBrandById =
  createAsyncThunk<
    Brand,
    number,
    {
      rejectValue: string;
    }
  >(
    'brand/getById',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        const response =
          await BrandApi.getById(id);

        if (
          response.data.isSuccess === false
        ) {
          return rejectWithValue(
            response.data.message ||
              'خطا در دریافت برند',
          );
        }

        return extractBrand(
          response.data,
        );
      } catch (
        error: unknown
      ) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در دریافت برند',
          ),
        );
      }
    },
  );

export const createBrand =
  createAsyncThunk<
    Brand,
    Brand,
    {
      rejectValue: string;
    }
  >(
    'brand/create',

    async (
      data,
      {
        rejectWithValue,
      },
    ) => {
      try {
        const response =
          await BrandApi.create(data);

        if (
          response.data.isSuccess === false
        ) {
          return rejectWithValue(
            response.data.message ||
              'خطا در ایجاد برند',
          );
        }

        return extractBrand(
          response.data,
        );
      } catch (
        error: unknown
      ) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در ایجاد برند',
          ),
        );
      }
    },
  );

export const updateBrand =
  createAsyncThunk<
    Brand,
    {
      id: number;
      data: Brand;
    },
    {
      rejectValue: string;
    }
  >(
    'brand/update',

    async (
      {
        id,
        data,
      },
      {
        rejectWithValue,
      },
    ) => {
      try {
        const response =
          await BrandApi.update(
            id,
            data,
          );

        if (
          response.data.isSuccess === false
        ) {
          return rejectWithValue(
            response.data.message ||
              'خطا در ویرایش برند',
          );
        }

        return extractBrand(
          response.data,
        );
      } catch (
        error: unknown
      ) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در ویرایش برند',
          ),
        );
      }
    },
  );

export const deleteBrand =
  createAsyncThunk<
    number,
    number,
    {
      rejectValue: string;
    }
  >(
    'brand/delete',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        const response =
          await BrandApi.delete(id);

        if (
          response.data.isSuccess === false
        ) {
          return rejectWithValue(
            response.data.message ||
              'خطا در حذف برند',
          );
        }

        return id;
      } catch (
        error: unknown
      ) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در حذف برند',
          ),
        );
      }
    },
  );
