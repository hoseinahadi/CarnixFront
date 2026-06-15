import axiosInstance from '@/services/api/common/axiosInstance';

export const orderApi = {
  // دریافت سفارش‌های کاربر
  getMyOrders: async (page: number = 1, pageSize: number = 10) =>
    await axiosInstance.get('/UserOrders/my-orders', {
      params: { page, pageSize }
    }),

  // دریافت جزئیات یک سفارش
  getOrderDetail: async (id: number) =>
    await axiosInstance.get(`/UserOrders/my-orders/${id}`),

  // دریافت پیگیری سفارش
  getOrderTracking: async (id: number) =>
    await axiosInstance.get(`/UserOrders/my-orders/${id}/tracking`),

  // لغو سفارش
  cancelOrder: async (id: number, reason: string) =>
    await axiosInstance.post(`/UserOrders/my-orders/${id}/cancel`, { reason }),
};