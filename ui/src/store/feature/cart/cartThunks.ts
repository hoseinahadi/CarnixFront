import { createAsyncThunk } from '@reduxjs/toolkit';

import { CartApi } from '@/features/cart/api/CartApi';

import type { Cart } from '@/models/cart/Cart';
import type { CartState } from '@/models/cart/CartState';


// ============================================================
// CONSTANTS
// ============================================================

const CART_CACHE_TTL_MS = 30_000;


// ============================================================
// TYPES
// ============================================================

interface FetchCartArgs {
  force?: boolean;
}


interface FetchCartResult {
  cart: Cart | null;
  fetchedAt: number;
}


/*
 * فقط بخشی از RootState که این Feature به آن نیاز دارد.
 *
 * با این کار cartThunks مجبور نیست RootState اصلی Store
 * را import کند و احتمال Circular Dependency هم کمتر می‌شود.
 */
interface CartRootState {
  cart: CartState;
}


/*
 * تمام Thunkهای Cart باید State و rejectValue یکسان داشته باشند.
 *
 * نکته مهم:
 * وقتی state مشخص باشد، Redux Toolkit نوع dispatch را هم
 * بر اساس همین State می‌سازد.
 *
 * در نتیجه:
 *
 * dispatch(fetchMyCart(...))
 *
 * داخل addToCart / removeCartItem / ... کاملاً Type Safe می‌شود.
 */
type CartThunkConfig = {
  state: CartRootState;
  rejectValue: string;
};


/*
 * یک نسخه Pre-Typed از createAsyncThunk می‌سازیم.
 *
 * از این به بعد تمام thunkهای این فایل باید با
 * createCartThunk ساخته شوند، نه createAsyncThunk مستقیم.
 */
const createCartThunk =
  createAsyncThunk.withTypes<CartThunkConfig>();


// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {

    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
};


// ============================================================
// FETCH CART
// ============================================================

/**
 * GET سبد خرید در Header، CartPage، Login و visibilitychange
 * استفاده می‌شود.
 *
 * condition جلوی:
 *
 * - درخواست هم‌زمان
 * - Fetch مجدد در بازه کوتاه
 *
 * را می‌گیرد.
 */
export const fetchMyCart =
  createCartThunk<
    FetchCartResult,
    FetchCartArgs | undefined
  >(
    'cart/fetchMyCart',

    async (
      _,
      {
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.getMyCart();

        if (response.data.isSuccess) {

          return {
            cart:
              response.data.data ??
              null,

            fetchedAt:
              Date.now(),
          };

        }

        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت سبد خرید',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در دریافت سبد خرید',
          ),
        );

      }

    },

    {
      condition: (
        args,
        {
          getState,
        },
      ) => {

        const state =
          getState().cart;

        /*
         * Request قبلی هنوز در حال اجراست.
         */
        if (
          state.fetchStatus ===
          'loading'
        ) {
          return false;
        }


        /*
         * Caller صراحتاً Refresh اجباری خواسته.
         */
        if (args?.force) {
          return true;
        }


        /*
         * هنوز هیچ Cartای Fetch نشده.
         */
        if (!state.lastFetchedAt) {
          return true;
        }


        /*
         * Cache هنوز معتبر است.
         */
        return (
          Date.now() -
            state.lastFetchedAt >=
          CART_CACHE_TTL_MS
        );

      },
    },
  );


// ============================================================
// ADD TO CART
// ============================================================

export const addToCart =
  createCartThunk(
    'cart/addToCart',

    async (
      {
        productId,
        quantity,
        refreshCart = true,
      }: {
        productId: number;
        quantity: number;
        refreshCart?: boolean;
      },

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.addToCart(
            productId,
            quantity,
          );

        if (response.data.isSuccess) {

          if (refreshCart) {

            /*
             * چون تمام Thunkها از createCartThunk استفاده
             * می‌کنند، dispatch اینجا CartRootState را می‌شناسد.
             */
            await dispatch(
              fetchMyCart({
                force: true,
              }),
            );

          }

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در افزودن به سبد خرید',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در افزودن به سبد خرید',
          ),
        );

      }

    },
  );


// ============================================================
// UPDATE ITEM QUANTITY
// ============================================================

export const updateItemQuantity =
  createCartThunk(
    'cart/updateQuantity',

    async (
      {
        cartItemId,
        quantity,
      }: {
        cartItemId: number;
        quantity: number;
      },

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi
            .updateItemQuantity(
              cartItemId,
              quantity,
            );

        if (response.data.isSuccess) {

          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در تغییر تعداد',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در تغییر تعداد',
          ),
        );

      }

    },
  );


// ============================================================
// REMOVE CART ITEM
// ============================================================

export const removeCartItem =
  createCartThunk(
    'cart/removeItem',

    async (
      cartItemId: number,

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.removeItem(
            cartItemId,
          );

        if (response.data.isSuccess) {

          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در حذف آیتم',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در حذف آیتم',
          ),
        );

      }

    },
  );


// ============================================================
// APPLY COUPON
// ============================================================

export const applyCoupon =
  createCartThunk(
    'cart/applyCoupon',

    async (
      {
        cartId,
        couponCode,
      }: {
        cartId: number;
        couponCode: string;
      },

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.applyCoupon(
            cartId,
            couponCode,
          );

        if (response.data.isSuccess) {

          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'کد تخفیف نامعتبر است',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'کد تخفیف نامعتبر است',
          ),
        );

      }

    },
  );


// ============================================================
// REMOVE COUPON
// ============================================================

export const removeCoupon =
  createCartThunk(
    'cart/removeCoupon',

    async (
      cartId: number,

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.removeCoupon(
            cartId,
          );

        if (response.data.isSuccess) {

          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در حذف کوپن',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در حذف کوپن',
          ),
        );

      }

    },
  );


// ============================================================
// MERGE GUEST CART
// ============================================================

export const mergeGuestCart =
  createCartThunk(
    'cart/merge',

    async (
      _,
      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.mergeCart();

        if (response.data.isSuccess) {

          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در ادغام سبد خرید',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطا در ادغام سبد خرید',
          ),
        );

      }

    },
  );


// ============================================================
// PLACE ORDER
// ============================================================

export const placeOrderFromCart =
  createCartThunk(
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

      {
        dispatch,
        rejectWithValue,
      },
    ) => {

      try {

        const response =
          await CartApi.placeOrder(
            orderData,
          );

        if (response.data.isSuccess) {

          /*
           * بعد از ثبت سفارش، Cart باید دوباره از Backend
           * خوانده شود تا Header و CartPage نیز Sync شوند.
           */
          await dispatch(
            fetchMyCart({
              force: true,
            }),
          );

          return response.data.data;
        }

        return rejectWithValue(
          response.data.message ||
            'خطا در ثبت سفارش',
        );

      } catch (
        error: unknown
      ) {

        return rejectWithValue(
          getErrorMessage(
            error,
            'خطای شبکه',
          ),
        );

      }

    },
  );