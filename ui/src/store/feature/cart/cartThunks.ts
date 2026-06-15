

import { createAsyncThunk } from '@reduxjs/toolkit';
import { CartApi } from '@/features/cart/api/CartApi';

// دریافت سبد خرید
export const fetchMyCart = createAsyncThunk(
  'cart/fetchMyCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CartApi.getMyCart();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت سبد خرید');
    }
  }
);

// افزودن به سبد خرید
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: number; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.addToCart(productId, quantity);
      if (response.data.isSuccess) {
        dispatch(fetchMyCart()); // آپدیت سبد خرید بعد از افزودن
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در افزودن به سبد خرید');
    }
  }
);

// تغییر تعداد
export const updateItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.updateItemQuantity(cartItemId, quantity);
      if (response.data.isSuccess) {
        dispatch(fetchMyCart());
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در تغییر تعداد');
    }
  }
);

// حذف آیتم
export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.removeItem(cartItemId);
      if (response.data.isSuccess) {
        dispatch(fetchMyCart());
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف آیتم');
    }
  }
);

// اعمال کوپن
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ cartId, couponCode }: { cartId: number; couponCode: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.applyCoupon(cartId, couponCode);
      if (response.data.isSuccess) {
        dispatch(fetchMyCart());
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'کد تخفیف نامعتبر است');
    }
  }
);

// حذف کوپن
export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (cartId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.removeCoupon(cartId);
      if (response.data.isSuccess) {
        dispatch(fetchMyCart());
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف کوپن');
    }
  }
);

// ادغام سبد خرید بعد از لاگین
export const mergeGuestCart = createAsyncThunk(
  'cart/merge',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await CartApi.mergeCart();
      if (response.data.isSuccess) {
        dispatch(fetchMyCart());
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ادغام سبد خرید');
    }
  }
);
