import { createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '@/features/orders/api/orderApi';

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async ({ page, pageSize }: { page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await orderApi.getMyOrders(page, pageSize);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت سفارش‌ها');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrderDetail(id);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت جزئیات سفارش');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await orderApi.cancelOrder(id, reason);
      if (response.data.isSuccess) {
        return id;
      }
      return rejectWithValue(response.data.message || 'خطا در لغو سفارش');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);