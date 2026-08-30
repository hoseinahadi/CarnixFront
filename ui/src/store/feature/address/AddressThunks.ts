// features/address/redux/AddressThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import type { CreateAddressDto } from '@/models/address/CreateAddressDto';
import type { UpdateAddressDto } from '@/models/address/UpdateAddressDto';
import { AddressApi } from '@/features/address/api/AddressApi';

const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') return Object.values(errors).flat().join(', ');
  }
  if (error.message) return error.message;
  return 'خطای ناشناخته رخ داد';
};

// ============================
// دریافت همه آدرس‌ها (سازگار با PagedResult)
// ============================
const ADDRESS_CACHE_TTL_MS = 60_000;

type AddressFetchArgs = { force?: boolean } | undefined;

type AddressRootState = {
  address: {
    fetchStatus?: 'idle' | 'loading' | 'succeeded' | 'failed';
    lastFetchedAt?: number | null;
  };
};

export const fetchAddresses = createAsyncThunk<
  { addresses: AddressResponseDto[]; fetchedAt: number },
  AddressFetchArgs,
  { state: AddressRootState; rejectValue: string }
>(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AddressApi.getAll();

      if (response.data?.isSuccess) {
        const resData: any = response.data.data;
        let addresses: AddressResponseDto[] = [];

        if (Array.isArray(resData)) addresses = resData;
        else if (resData?.items && Array.isArray(resData.items)) addresses = resData.items;
        else if (resData?.Items && Array.isArray(resData.Items)) addresses = resData.Items;

        return { addresses, fetchedAt: Date.now() };
      }

      return rejectWithValue(response.data?.message || 'خطا در دریافت آدرس‌ها');
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().address;
      if (state.fetchStatus === 'loading') return false;
      if (args?.force) return true;
      if (!state.lastFetchedAt) return true;
      return Date.now() - state.lastFetchedAt >= ADDRESS_CACHE_TTL_MS;
    },
  },
);

// ============================
// ایجاد آدرس جدید
// ============================
export const createAddress = createAsyncThunk<AddressResponseDto, CreateAddressDto>(
  'address/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AddressApi.create(data);
      if (response.data?.isSuccess) {
        const resData: any = response.data.data;
        if (Array.isArray(resData)) return resData[0];
        return resData;
      }
      return rejectWithValue(response.data?.message || 'خطا در ایجاد آدرس');
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================
// ویرایش آدرس
// ============================
export const updateAddress = createAsyncThunk<
  AddressResponseDto,
  { id: number; data: UpdateAddressDto }
>(
  'address/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await AddressApi.update(id, data);
      if (response.data?.isSuccess) {
        const resData: any = response.data.data;
        if (Array.isArray(resData)) {
          return resData.find((a: any) => a.userAddressId === id) || resData[0];
        }
        return resData;
      }
      return rejectWithValue(response.data?.message || 'خطا در ویرایش آدرس');
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================
// حذف آدرس
// ============================
export const deleteAddress = createAsyncThunk<number, number>(
  'address/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AddressApi.delete(id);
      if (response.data?.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data?.message || 'خطا در حذف آدرس');
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================
// تنظیم آدرس پیش‌فرض
// ============================
export const setDefaultAddress = createAsyncThunk<number, number>(
  'address/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AddressApi.setDefault(id);
      if (response.data?.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data?.message || 'خطا در تنظیم آدرس پیش‌فرض');
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);