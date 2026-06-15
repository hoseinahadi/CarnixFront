// src/models/cart/CartState.ts
import { Cart } from "./Cart";

export interface CartState {
  cart: Cart | null;
  loading: boolean;       // برای وضعیت لودینگ دریافت کل سبد خرید
  actionLoading: boolean; // برای وضعیت لودینگ دکمه‌ها (افزودن/حذف/آپدیت)
  error: string | null;
}
