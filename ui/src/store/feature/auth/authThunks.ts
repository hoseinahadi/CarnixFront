import {
  createAsyncThunk,
} from '@reduxjs/toolkit';

import { authApi } from '@/features/auth/api/routes';

import type {
  AuthResponse,
} from '@/models/auth/AuthResponse';

import type {
  LoginRequest,
} from '@/models/auth/LoginRequest';

import type {
  SendOtpResponse,
  VerifyOtpResponse,
} from '@/models/auth/OtpResponse';

import type {
  RegisterRequest,
  RegisterResponse,
} from '@/models/auth/RegisterRequest';

import type {
  UserDetail,
} from '@/models/user/UserDetail';

import type {
  UserRole,
} from '@/models/user/UserRole';

import {
  getApiErrorMessage,
  unwrapOperationResult,
} from '@/services/api/common/apiError';

import {
  clearAuthStorage,
  extractAuthTokens,
  saveAuthTokens,
  saveUserSnapshot,
} from '@/services/api/common/authTokenStorage';

import type {
  AppDispatch,
} from '@/store';

import {
  fetchMyCart,
  mergeGuestCart,
} from '@/store/feature/cart/cartThunks';

import {
  sessionCleared,
} from '@/store/actions/sessionActions';

/*
 * بعد از Login / OTP / Register موفق:
 *
 * 1. اطلاعات کاربر دریافت می‌شود.
 * 2. سبد مهمان با سبد حساب Merge می‌شود.
 * 3. اگر Merge به هر دلیلی انجام نشد،
 *    حداقل سبد حساب کاربر Fetch می‌شود.
 *
 * نکته:
 * شکست این عملیات‌ها نباید Login موفق را
 * به Login ناموفق تبدیل کند.
 */
const loadAuthenticatedUserData = async (
  dispatch: AppDispatch,
): Promise<void> => {
  /*
   * دریافت اطلاعات کاربر
   */
  try {
    await dispatch(
      getMeThunk({
        force: true,
      }),
    ).unwrap();
  } catch {
    /*
     * خطای getMe در Slice ثبت می‌شود.
     * Authentication موفق را Fail نمی‌کنیم.
     */
  }

  /*
   * ابتدا تلاش می‌کنیم Guest Cart را Merge کنیم.
   *
   * axiosClient همان X-Session-Id قبلی مهمان را
   * همراه Token جدید ارسال می‌کند.
   *
   * بنابراین Backend می‌تواند:
   *
   * Guest Session Cart
   * +
   * User Cart
   *
   * را با هم ادغام کند.
   */
  try {
    await dispatch(
      mergeGuestCart(),
    ).unwrap();

    /*
     * mergeGuestCart خودش بعد از Merge موفق
     * fetchMyCart({ force: true }) را اجرا می‌کند.
     *
     * بنابراین در حالت موفق Fetch دوباره لازم نیست.
     */
    return;
  } catch {
    /*
     * ممکن است:
     *
     * - Guest Cart وجود نداشته باشد
     * - Merge Endpoint موقتاً خطا بدهد
     * - Backend در دسترس نباشد
     *
     * Login را Fail نمی‌کنیم.
     */
  }

  /*
   * اگر Merge موفق نشد،
   * حداقل Cart واقعی حساب کاربر را دریافت می‌کنیم.
   */
  try {
    await dispatch(
      fetchMyCart({
        force: true,
      }),
    ).unwrap();
  } catch {
    /*
     * نبودن یا در دسترس نبودن Cart
     * مانع Login کاربر نمی‌شود.
     */
  }
};

export const getMeThunk = createAsyncThunk<
  UserDetail,
  { force?: boolean } | undefined,
  {
    state: {
      auth: {
        userDetail: UserDetail | null;
        meLoading: boolean;
      };
    };
    rejectValue: string;
  }
>(
  'auth/getMe',

  async (
    _,
    {
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.getMe();

      const user =
        unwrapOperationResult<UserDetail>(
          response.data,
          'خطا در دریافت اطلاعات کاربر',
        );

      saveUserSnapshot(user);

      return user;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'خطا در دریافت اطلاعات کاربر',
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
      const {
        userDetail,
        meLoading,
      } = getState().auth;

      if (meLoading) {
        return false;
      }

      if (args?.force) {
        return true;
      }

      return !userDetail;
    },
  },
);

export const loginThunk = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  {
    dispatch: AppDispatch;
    rejectValue: string;
  }
>(
  'auth/login',

  async (
    credentials,
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.login(
          credentials,
        );

      const payload =
        unwrapOperationResult(
          response.data,
          'نام کاربری یا رمز عبور اشتباه است.',
        );

      const tokens =
        extractAuthTokens(
          payload,
        );

      if (!tokens) {
        return rejectWithValue(
          'پاسخ ورود معتبر نیست و Token دریافت نشد.',
        );
      }

      /*
       * Token باید قبل از Merge ذخیره شود،
       * چون /Cart/merge به Authentication نیاز دارد.
       */
      saveAuthTokens(
        tokens,
      );

      await loadAuthenticatedUserData(
        dispatch,
      );

      return {
        token:
          tokens.accessToken,

        refreshToken:
          tokens.refreshToken,

        message:
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload &&
          typeof payload.message ===
            'string'
            ? payload.message
            : undefined,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'نام کاربری یا رمز عبور اشتباه است.',
        ),
      );
    }
  },
);

export const getRolesThunk = createAsyncThunk<
  UserRole,
  void,
  {
    rejectValue: string;
  }
>(
  'auth/getRoles',

  async (
    _,
    {
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.getRoles();

      return unwrapOperationResult<UserRole>(
        response.data,
        'خطا در دریافت نقش‌ها',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'خطا در دریافت نقش‌ها',
        ),
      );
    }
  },
);

export const logoutThunk = createAsyncThunk<
  void,
  void,
  {
    dispatch: AppDispatch;
    rejectValue: string;
  }
>(
  'auth/logout',

  async (
    _,
    {
      dispatch,
    },
  ) => {
    try {
      await authApi.logout();
    } catch {
      /*
       * حتی اگر Backend در دسترس نباشد،
       * اطلاعات محلی باید پاک شود.
       */
    } finally {
      clearAuthStorage();

      /*
       * Stateهای وابسته به User نیز
       * همان لحظه پاک شوند.
       */
      dispatch(
        sessionCleared(),
      );
    }
  },
);

export const registerThunk = createAsyncThunk<
  RegisterResponse,
  RegisterRequest,
  {
    dispatch: AppDispatch;
    rejectValue: string;
  }
>(
  'auth/register',

  async (
    credentials,
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.register(
          credentials,
        );

      const payload =
        unwrapOperationResult<RegisterResponse>(
          response.data,
          'ثبت‌نام انجام نشد.',
        );

      const tokens =
        extractAuthTokens(
          payload,
        );

      /*
       * اگر Backend بعد از Register
       * Token برگرداند، کاربر همان لحظه
       * Authenticated می‌شود.
       */
      if (tokens) {
        saveAuthTokens(
          tokens,
        );

        /*
         * Guest Cart نیز همین‌جا Merge می‌شود.
         */
        await loadAuthenticatedUserData(
          dispatch,
        );
      }

      return {
        ...payload,

        ...(tokens
          ? {
              token:
                tokens.accessToken,

              accessToken:
                tokens.accessToken,

              refreshToken:
                tokens.refreshToken,
            }
          : {}),
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'خطایی در ثبت‌نام رخ داد. دوباره تلاش کنید.',
        ),
      );
    }
  },
);

export const sendOtpThunk = createAsyncThunk<
  SendOtpResponse,
  {
    phoneNumber: string;
  },
  {
    rejectValue: string;
  }
>(
  'auth/sendOtp',

  async (
    data,
    {
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.sendOtp(
          data,
        );

      return unwrapOperationResult<SendOtpResponse>(
        response.data,
        'ارسال کد تأیید انجام نشد.',
      );
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'خطا در ارسال کد تأیید',
        ),
      );
    }
  },
);

export const verifyOtpThunk = createAsyncThunk<
  VerifyOtpResponse,
  {
    phoneNumber: string;
    code: string;
  },
  {
    dispatch: AppDispatch;
    rejectValue: string;
  }
>(
  'auth/verifyOtp',

  async (
    data,
    {
      dispatch,
      rejectWithValue,
    },
  ) => {
    try {
      const response =
        await authApi.verifyOtp(
          data,
        );

      const payload =
        unwrapOperationResult<VerifyOtpResponse>(
          response.data,
          'کد تأیید معتبر نیست.',
        );

      const tokens =
        extractAuthTokens(
          payload,
        );

      /*
       * اگر Backend می‌گوید کاربر قبلاً
       * ثبت شده، باید Token هم بدهد.
       */
      if (
        payload.isRegistered &&
        !tokens
      ) {
        return rejectWithValue(
          'کاربر تأیید شد، اما Token ورود دریافت نشد.',
        );
      }

      /*
       * کاربر ثبت‌شده:
       *
       * OTP
       * ↓
       * Token
       * ↓
       * Merge Guest Cart
       * ↓
       * Fetch User Cart
       */
      if (tokens) {
        saveAuthTokens(
          tokens,
        );

        await loadAuthenticatedUserData(
          dispatch,
        );
      }

      return {
        ...payload,

        ...(tokens
          ? {
              token:
                tokens.accessToken,

              accessToken:
                tokens.accessToken,

              refreshToken:
                tokens.refreshToken,
            }
          : {}),
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          'کد تأیید اشتباه است.',
        ),
      );
    }
  },
);