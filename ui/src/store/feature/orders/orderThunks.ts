import { OrderApi } from '@/features/orders/api/orderApi';
import { createAsyncThunk } from '@reduxjs/toolkit';

const ORDER_LIST_CACHE_TTL_MS = 30_000;

type FetchOrdersArgs = { page?: number; pageSize?: number; force?: boolean } | undefined;
type OrdersRootState = {
  orders: {
    loading: boolean;
    detailLoading: boolean;
    lastListFetchKey: string | null;
    lastListFetchedAt: number | null;
    selectedOrder: { orderId?: number } | null;
  };
};

export const fetchMyOrders = createAsyncThunk<
  any,
  FetchOrdersArgs,
  { state: OrdersRootState; rejectValue: string }
>(
  'orders/fetchMyOrders',
  async (args = {}, { rejectWithValue }) => {
    const { page = 1, pageSize = 10 } = args || {};
    try {
      const response = await OrderApi.getMyOrders(page, pageSize);
      if (response.data.isSuccess) {
        return {
          result: response.data.data,
          fetchKey: `${page}:${pageSize}`,
          fetchedAt: Date.now(),
        };
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت سفارش‌ها');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت سفارش‌ها');
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().orders;
      if (state.loading) return false;
      if (args?.force) return true;
      const page = args?.page ?? 1;
      const pageSize = args?.pageSize ?? 10;
      const key = `${page}:${pageSize}`;
      return !state.lastListFetchedAt || state.lastListFetchKey !== key || Date.now() - state.lastListFetchedAt >= ORDER_LIST_CACHE_TTL_MS;
    },
  },
);

export const fetchOrderDetail = createAsyncThunk<
  any,
  number,
  { state: OrdersRootState; rejectValue: string }
>(
  'orders/fetchOrderDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await OrderApi.getOrderDetail(id);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message || 'خطا در دریافت جزئیات سفارش');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات سفارش');
    }
  },
  {
    condition: (id, { getState }) => {
      const state = getState().orders;
      if (state.detailLoading) return false;
      return state.selectedOrder?.orderId !== id;
    },
  },
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await OrderApi.cancelOrder(id, reason);
      if (response.data.isSuccess) return id;
      return rejectWithValue(response.data.message || 'خطا در لغو سفارش');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در لغو سفارش');
    }
  }
);
