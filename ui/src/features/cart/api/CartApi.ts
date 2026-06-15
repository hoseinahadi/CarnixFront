// features/cart/api/CartApi.ts

import { OperationResult } from "@/models/common/OperationResult";
import axiosInstance from "@/services/api/common/axiosInstance";
import { Cart } from "@/models/cart/Cart";

export const CartApi = {
  // دریافت سبد خرید فعلی
  getMyCart: async () =>
    await axiosInstance.get<OperationResult<Cart>>('/Cart/my-cart'),

  // افزودن به سبد خرید
  addToCart: async (productId: number, quantity: number = 1) =>
    await axiosInstance.post<OperationResult>('/Cart/add', { productId, quantity }),

  // بروزرسانی تعداد یک آیتم
  updateItemQuantity: async (cartItemId: number, quantity: number) =>
    await axiosInstance.put<OperationResult>(`/Cart/items/${cartItemId}/quantity`, { quantity }),

  // حذف یک آیتم
  removeItem: async (cartItemId: number) =>
    await axiosInstance.delete<OperationResult>(`/Cart/items/${cartItemId}`),

  // خالی کردن کامل سبد
  clearCart: async (cartId: number) =>
    await axiosInstance.delete<OperationResult>(`/Cart/${cartId}/clear`),

  // ادغام سبد خرید مهمان با کاربر (بعد از لاگین)
  mergeCart: async () =>
    await axiosInstance.post<OperationResult>('/Cart/merge'),

  // اعمال کد تخفیف
  applyCoupon: async (cartId: number, couponCode: string) =>
    await axiosInstance.post<OperationResult>(`/Cart/${cartId}/coupon`, { couponCode }),

  // حذف کد تخفیف
  removeCoupon: async (cartId: number) =>
    await axiosInstance.delete<OperationResult>(`/Cart/${cartId}/coupon`),

  // اعتبارسنجی قبل از پرداخت
  validateCart: async (cartId: number) =>
    await axiosInstance.get<OperationResult>(`/Cart/${cartId}/validate`),
};
