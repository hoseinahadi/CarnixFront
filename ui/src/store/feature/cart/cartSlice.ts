import { createSlice } from '@reduxjs/toolkit';
import { CartState } from '@/models/cart/CartState';
import { 
  fetchMyCart, 
  addToCart, 
  updateItemQuantity, 
  removeCartItem, 
  applyCoupon, 
  removeCoupon 
} from './cartThunks';
import { logoutThunk } from '@/store/feature/auth/authThunks';

const initialState: CartState = {
  cart: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCartState: (state) => {
      state.cart = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // ─── Fetch My Cart ───
    builder
      .addCase(fetchMyCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchMyCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // ⭐ اگه خطای 401 بود (توکن نامعتبر)، cart رو null نکن
        // چون اینترسپتور داره توکن رو رفرش می‌کنه
      });

    // ─── Actions (Add, Update, Remove, Coupon) ───
    const actionThunks = [addToCart, updateItemQuantity, removeCartItem, applyCoupon, removeCoupon];
    
    actionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.actionLoading = false;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionLoading = false;
          state.error = action.payload as string;
        });
    });

    // ⭐ پاکسازی cart بعد از logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.cart = null;
      state.error = null;
    });
  },
});

export const { clearCartError, resetCartState } = cartSlice.actions;
export default cartSlice.reducer;