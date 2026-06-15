import { createAsyncThunk } from '@reduxjs/toolkit';
import { AddressApi } from '@/features/address/api/AddressApi';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import type { CreateAddressDto } from '@/models/address/CreateAddressDto';
import type { UpdateAddressDto } from '@/models/address/UpdateAddressDto';

// ============================
// دریافت همه آدرس‌ها
// ============================
export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AddressApi.getAll();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت آدرس‌ها');
    }
  }
);

// ============================
// دریافت یک آدرس با شناسه
// ============================
export const fetchAddressById = createAsyncThunk(
  'address/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await AddressApi.getById(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت آدرس');
    }
  }
);

// ============================
// ایجاد آدرس جدید
// ============================
export const createAddress = createAsyncThunk(
  'address/create',
  async (data: CreateAddressDto, { rejectWithValue }) => {
    try {
      const response = await AddressApi.create(data);
      if (response.data.isSuccess) {
        return response.data.data; // بک‌اند لیست به‌روز را برمی‌گرداند
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد آدرس');
    }
  }
);

// ============================
// ویرایش آدرس
// ============================
export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ id, data }: { id: number; data: UpdateAddressDto }, { rejectWithValue }) => {
    try {
      const response = await AddressApi.update(id, data);
      if (response.data.isSuccess) {
        return response.data.data; // بک‌اند لیست به‌روز را برمی‌گرداند
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ویرایش آدرس');
    }
  }
);

// ============================
// حذف آدرس
// ============================
export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await AddressApi.delete(id);
      if (response.data.isSuccess) {
        return response.data.data; // بک‌اند لیست به‌روز را برمی‌گرداند
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف آدرس');
    }
  }
);

// ============================
// تنظیم آدرس پیش‌فرض
// ============================
export const setDefaultAddress = createAsyncThunk(
  'address/setDefault',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await AddressApi.setDefault(id);
      if (response.data.isSuccess) {
        return response.data.data; // بک‌اند لیست به‌روز را برمی‌گرداند
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تنظیم آدرس پیش‌فرض');
    }
  }
);