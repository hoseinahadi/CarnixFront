// features/orders/api/OrderApi.ts

import axiosClient from '@/services/api/common/axiosClient';
import { OperationResult } from '@/models/common/OperationResult';
import type { OrderDto } from '@/models/order/OrderDto';

export const OrderApi = {
  // دریافت سفارش‌های کاربر
  getMyOrders: async (page: number = 1, pageSize: number = 10) =>
    await axiosClient.get<OperationResult<{
      orders: OrderDto[];
      totalCount: number;
      currentPage: number;
      pageSize: number;
      totalPages: number;
    }>>('/UserOrders/my-orders', {
      params: { page, pageSize }
    }),

  // دریافت جزئیات یک سفارش
  getOrderDetail: async (id: number) =>
    await axiosClient.get<OperationResult<OrderDto>>(`/UserOrders/my-orders/${id}`),

  // دریافت پیگیری سفارش
  getOrderTracking: async (id: number) =>
    await axiosClient.get<OperationResult<any>>(`/UserOrders/my-orders/${id}/tracking`),

  // لغو سفارش
  cancelOrder: async (id: number, reason: string) =>
    await axiosClient.post<OperationResult>(`/UserOrders/my-orders/${id}/cancel`, { 
      reason 
    }),
};