// store/feature/orders/orderThunks.ts

import { OrderApi } from '@/features/orders/api/orderApi';
import { createAsyncThunk } from '@reduxjs/toolkit';


// دریافت سفارش‌های کاربر
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (
    { page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await OrderApi.getMyOrders(page, pageSize);
      if (response.data.isSuccess) {
        return response.data.data ;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت سفارش‌ها');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در دریافت سفارش‌ها'
      );
    }
  }
);

// دریافت جزئیات سفارش
export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await OrderApi.getOrderDetail(id);
      if (response.data.isSuccess) {
        return response.data.data ;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت جزئیات سفارش');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در دریافت جزئیات سفارش'
      );
    }
  }
);

// لغو سفارش
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (
    { id, reason }: { id: number; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await OrderApi.cancelOrder(id, reason);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message || 'خطا در لغو سفارش');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در لغو سفارش'
      );
    }
  }
);