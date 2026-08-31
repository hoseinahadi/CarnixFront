import axiosClient from '@/services/api/common/axiosClient';

import type {
  OperationResult,
} from '@/models/common/OperationResult';

import type {
  Cart,
} from '@/models/cart/Cart';

/*
 * پاسخ Validate ممکن است در Backendهای مختلف:
 *
 * data: true
 *
 * یا:
 *
 * data: {
 *   isValid: true
 * }
 *
 * باشد.
 */
export interface CartValidationResult {
  isValid?: boolean;
  errors?: string[];
  message?: string;
}

export type CartValidationData =
  | boolean
  | CartValidationResult
  | null;

export const CartApi = {
  getMyCart: async () =>
    await axiosClient.get<
      OperationResult<Cart>
    >(
      '/Cart/my-cart',
    ),

  addToCart: async (
    productId: number,
    quantity: number = 1,
  ) =>
    await axiosClient.post<
      OperationResult
    >(
      '/Cart/add',
      {
        productId,
        quantity,
      },
    ),

  updateItemQuantity: async (
    cartItemId: number,
    quantity: number,
  ) =>
    await axiosClient.put<
      OperationResult
    >(
      `/Cart/items/${cartItemId}/quantity`,
      {
        quantity,
      },
    ),

  removeItem: async (
    cartItemId: number,
  ) =>
    await axiosClient.delete<
      OperationResult
    >(
      `/Cart/items/${cartItemId}`,
    ),

  clearCart: async (
    cartId: number,
  ) =>
    await axiosClient.delete<
      OperationResult
    >(
      `/Cart/${cartId}/clear`,
    ),

  mergeCart: async () =>
    await axiosClient.post<
      OperationResult
    >(
      '/Cart/merge',
    ),

  applyCoupon: async (
    cartId: number,
    couponCode: string,
  ) =>
    await axiosClient.post<
      OperationResult
    >(
      `/Cart/${cartId}/coupon`,
      {
        couponCode,
      },
    ),

  removeCoupon: async (
    cartId: number,
  ) =>
    await axiosClient.delete<
      OperationResult
    >(
      `/Cart/${cartId}/coupon`,
    ),

  /*
   * مهم:
   *
   * قبلاً:
   * OperationResult
   *
   * بود و چون Generic پیش‌فرض void است،
   * result.data از دید TypeScript برابر void می‌شد.
   *
   * حالا Contract واقعی Validate مشخص شده است.
   */
  validateCart: async (
    cartId: number,
  ) =>
    await axiosClient.get<
      OperationResult<CartValidationData>
    >(
      `/Cart/${cartId}/validate`,
    ),

  placeOrder: async (
    orderData: any,
  ) =>
    await axiosClient.post<
      OperationResult<{
        orderId?: number;
        id?: number;
        paymentUrl?: string;
      }>
    >(
      '/UserOrders/place-from-cart',
      orderData,
    ),
};