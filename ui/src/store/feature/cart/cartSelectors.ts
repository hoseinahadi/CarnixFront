import type { RootState } from '@/store';

// 🟢 تعریف یک رفرنس ثابت برای جلوگیری از رندر مجدد (Re-render) بی‌نهایت
const EMPTY_ARRAY: any[] = [];

// سلکتورهای پایه
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartActionLoading = (state: RootState) => state.cart.actionLoading;
export const selectCartError = (state: RootState) => state.cart.error;

// سلکتورهای محاسباتی
export const selectTotalCartItemsCount = (state: RootState) => 
  state.cart.cart?.totalItemsCount || 0;

// 🟢 باگ منطقی اصلاح شد: (قبلا taxAmount بود که اشتباه است)
export const selectCartTotalAmount = (state: RootState) => 
  state.cart.cart?.grandTotal || state.cart.cart?.totalItemsCount || 0;

// 🟢 جلوگیری از رندرهای اضافی با اختصاص رفرنس ثابت
export const selectCartItems = (state: RootState) => 
  state.cart.cart?.items || EMPTY_ARRAY;

// 🟢 باگ منطقی اصلاح شد: (cartId تکراری نوشته شده بود)
export const selectCartId = (state: RootState) => 
  state.cart.cart?.cartId ||  0;