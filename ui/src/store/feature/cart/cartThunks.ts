import { createAsyncThunk } from '@reduxjs/toolkit';

import { CartApi } from '@/features/cart/api/CartApi';
import type { Cart } from '@/models/cart/Cart';
import type { CartState } from '@/models/cart/CartState';

const CART_CACHE_TTL_MS = 30_000;

interface FetchCartArgs {
  force?: boolean;
}

interface FetchCartResult {
  cart: Cart | null;
  fetchedAt: number;
}

interface CartRootState {
  cart: CartState;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/**
 * GET سبد خرید در Header، CartPage، Login و visibilitychange استفاده می‌شود.
 * condition جلوی درخواست هم‌زمان و fetch مجدد در بازه کوتاه را می‌گیرد.
 */
export const fetchMyCart = createAsyncThunk<
  FetchCartResult,
  FetchCartArgs | undefined,
  { state: CartRootState; rejectValue: string }
>(
  'cart/fetchMyCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartApi.getMyCart();
      if (response.data.isSuccess) {
        return {
          cart: response.data.data ?? null,
          fetchedAt: Date.now(),
        };
      }

      return rejectWithValue(response.data.message || 'خطا در دریافت سبد خرید');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در دریافت سبد خرید'));
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().cart;
      if (state.fetchStatus === 'loading') return false;
      if (args?.force) return true;
      if (!state.lastFetchedAt) return true;
      return Date.now() - state.lastFetchedAt >= CART_CACHE_TTL_MS;
    },
  },
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { productId, quantity, refreshCart = true }: { productId: number; quantity: number; refreshCart?: boolean },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await CartApi.addToCart(productId, quantity);
      if (response.data.isSuccess) {
        if (refreshCart) {
          await dispatch(fetchMyCart({ force: true }));
        }
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در افزودن به سبد خرید');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در افزودن به سبد خرید'));
    }
  },
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (
    { cartItemId, quantity }: { cartItemId: number; quantity: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await CartApi.updateItemQuantity(cartItemId, quantity);
      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در تغییر تعداد');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در تغییر تعداد'));
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.removeItem(cartItemId);
      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در حذف آیتم');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در حذف آیتم'));
    }
  },
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (
    { cartId, couponCode }: { cartId: number; couponCode: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await CartApi.applyCoupon(cartId, couponCode);
      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'کد تخفیف نامعتبر است');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'کد تخفیف نامعتبر است'));
    }
  },
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (cartId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.removeCoupon(cartId);
      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در حذف کوپن');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در حذف کوپن'));
    }
  },
);

export const mergeGuestCart = createAsyncThunk(
  'cart/merge',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.mergeCart();
      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data;
      }
      return rejectWithValue(response.data.message || 'خطا در ادغام سبد خرید');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطا در ادغام سبد خرید'));
    }
  },
);

export const placeOrderFromCart = createAsyncThunk(
  'cart/placeOrder',
  async (
    orderData: {
      cartId: number;
      zipCode: string;
      phoneNumber: string;
      destinationAddress: string;
      recipientName: string;
      city: string;
      province: string;
      shippingMethod: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await CartApi.placeOrder(orderData);

      if (response.data.isSuccess) {
        await dispatch(fetchMyCart({ force: true }));
        return response.data.data;
      }

      return rejectWithValue(response.data.message || 'خطا در ثبت سفارش');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'خطای شبکه'));
    }
  },
);
