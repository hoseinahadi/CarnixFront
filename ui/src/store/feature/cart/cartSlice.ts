import { createSlice } from '@reduxjs/toolkit';
import type { CartState } from '@/models/cart/CartState';
import {
  fetchMyCart,
  addToCart,
  updateItemQuantity,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  placeOrderFromCart,
} from './cartThunks';
import { logoutThunk } from '@/store/feature/auth/authThunks';

const initialState: CartState = {
  cart: null,
  loading: false,
  actionLoading: false,
  actionPendingCount: 0,
  error: null,
  fetchStatus: 'idle',
  lastFetchedAt: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCartState: () => initialState,
    invalidateCartCache: (state) => {
      state.lastFetchedAt = null;
      if (state.fetchStatus !== 'loading') state.fetchStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCart.pending, (state) => {
        state.fetchStatus = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCart.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.loading = false;
        state.cart = action.payload.cart;
        state.lastFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchMyCart.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.loading = false;
        state.error = action.payload as string;
      });

    const actionThunks = [
      addToCart,
      updateItemQuantity,
      removeCartItem,
      applyCoupon,
      removeCoupon,
    ];

    actionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionPendingCount += 1;
          state.actionLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.actionPendingCount = Math.max(0, state.actionPendingCount - 1);
          state.actionLoading = state.actionPendingCount > 0;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionPendingCount = Math.max(0, state.actionPendingCount - 1);
          state.actionLoading = state.actionPendingCount > 0;
          state.error = action.payload as string;
        });
    });

    builder
      .addCase(placeOrderFromCart.pending, (state) => {
        state.actionPendingCount += 1;
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(placeOrderFromCart.fulfilled, (state) => {
        state.actionPendingCount = Math.max(0, state.actionPendingCount - 1);
        state.actionLoading = state.actionPendingCount > 0;
      })
      .addCase(placeOrderFromCart.rejected, (state, action) => {
        state.actionPendingCount = Math.max(0, state.actionPendingCount - 1);
        state.actionLoading = state.actionPendingCount > 0;
        state.error = action.payload as string;
      });

    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const {
  clearCartError,
  resetCartState,
  invalidateCartCache,
} = cartSlice.actions;
export default cartSlice.reducer;
