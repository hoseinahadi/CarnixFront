

import type { RootState } from '@/store'; // مسیر استور اصلی خود را تنظیم کنید
import { createSelector } from '@reduxjs/toolkit';

// سلکتورهای پایه
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartActionLoading = (state: RootState) => state.cart.actionLoading;
export const selectCartError = (state: RootState) => state.cart.error;

// نسخه قبلی که دستی حساب میکرد پاک میشود و این نسخه جایگزین میشود:
   export const selectTotalCartItemsCount = (state: RootState) => state.cart.cart?.totalItemsCount || 0;
   
   // برای قیمت کل
   export const selectCartTotalAmount = (state: RootState) => state.cart.cart?.taxAmount || 0;