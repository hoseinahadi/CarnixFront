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
} from '@/store/feature/cart/cartThunks';

const loadAuthenticatedUserData = async (
  dispatch: AppDispatch,
): Promise<void> => {
  /*
   * شکست getMe یا Cart نباید Login موفق را به Login ناموفق تبدیل کند.
   * AuthGuard بعداً می‌تواند اطلاعات کاربر را دوباره دریافت کند.
   */
  try {
    await dispatch(
      getMeThunk(),
    ).unwrap();
  } catch {
    // خطا در Slice ثبت می‌شود.
  }

  try {
    await dispatch(
      fetchMyCart(),
    ).unwrap();
  } catch {
    // خالی یا در دسترس نبودن سبد خرید مانع ورود کاربر نمی‌شود.
  }
};

export const getMeThunk = createAsyncThunk<
  UserDetail,
  void,
  {
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
        extractAuthTokens(payload);

      if (!tokens) {
        return rejectWithValue(
          'پاسخ ورود معتبر نیست و Token دریافت نشد.',
        );
      }

      saveAuthTokens(tokens);

      await loadAuthenticatedUserData(
        dispatch,
      );

      return {
        token: tokens.accessToken,
        refreshToken:
          tokens.refreshToken,
        message:
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload &&
          typeof payload.message === 'string'
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
    rejectValue: string;
  }
>(
  'auth/logout',

  async () => {
    try {
      await authApi.logout();
    } catch {
      /*
       * حتی اگر Backend در دسترس نباشد، اطلاعات محلی باید پاک شود
       * تا کاربر در UI واردشده باقی نماند.
       */
    } finally {
      clearAuthStorage();
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
        extractAuthTokens(payload);

      if (tokens) {
        saveAuthTokens(tokens);

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
        await authApi.sendOtp(data);

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
        await authApi.verifyOtp(data);

      const payload =
        unwrapOperationResult<VerifyOtpResponse>(
          response.data,
          'کد تأیید معتبر نیست.',
        );

      const tokens =
        extractAuthTokens(payload);

      if (
        payload.isRegistered &&
        !tokens
      ) {
        return rejectWithValue(
          'کاربر تأیید شد، اما Token ورود دریافت نشد.',
        );
      }

      if (tokens) {
        saveAuthTokens(tokens);

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
