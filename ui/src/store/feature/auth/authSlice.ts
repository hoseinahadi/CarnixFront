import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  AuthResponse,
} from '@/models/auth/AuthResponse';

import type {
  UserDetail,
} from '@/models/user/UserDetail';

import type {
  UserRole,
} from '@/models/user/UserRole';

import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getUserSnapshot,
  saveAuthTokens,
} from '@/services/api/common/authTokenStorage';

import {
  setAuthFailureCallback,
} from '@/services/api/common/axiosClient';

import {
  getMeThunk,
  getRolesThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  verifyOtpThunk,
} from '@/store/feature/auth/authThunks';

export interface AuthState {
  userDetail: UserDetail | null;
  roles: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  const token = getAccessToken();
  const userDetail = getUserSnapshot();

  return {
    token,
    userDetail,
    roles: null,
    /*
     * وجود Token برای شروع Session کافی است.
     * اطلاعات کامل کاربر در AuthGuard از Backend دریافت می‌شود.
     */
    isAuthenticated: Boolean(token),
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),

  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.userDetail = null;
      state.roles = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      clearAuthStorage();
    },

    updateToken: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.error = null;

      saveAuthTokens({
        accessToken: action.payload,
        refreshToken:
          getRefreshToken() ?? undefined,
      });
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(
        registerThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        registerThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const token =
            action.payload.token ??
            action.payload.accessToken;

          if (token) {
            state.token = token;
            state.isAuthenticated = true;
          }
        },
      )
      .addCase(
        registerThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'ثبت‌نام انجام نشد.';
        },
      );

    builder
      .addCase(
        loginThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        loginThunk.fulfilled,
        (
          state,
          action: PayloadAction<AuthResponse>,
        ) => {
          state.loading = false;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(
        loginThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'ورود انجام نشد.';
          state.isAuthenticated = false;
        },
      );

    builder
      .addCase(
        verifyOtpThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        verifyOtpThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.error = null;

          const token =
            action.payload.token ??
            action.payload.accessToken;

          if (token) {
            state.token = token;
            state.isAuthenticated = true;
          }
        },
      )
      .addCase(
        verifyOtpThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'تأیید کد انجام نشد.';
        },
      );

    builder
      .addCase(
        getMeThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addCase(
        getMeThunk.fulfilled,
        (
          state,
          action: PayloadAction<UserDetail>,
        ) => {
          state.loading = false;
          state.userDetail = action.payload;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(
        getMeThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ??
            'دریافت اطلاعات کاربر انجام نشد.';

          /*
           * در خطای شبکه Token پاک نمی‌شود.
           * اگر خطا واقعاً 401/403 باشد، axiosClient از Callback زیر
           * clearAuth را Dispatch خواهد کرد.
           */
        },
      );

    builder
      .addCase(
        getRolesThunk.fulfilled,
        (state, action) => {
          state.roles = action.payload;
        },
      )
      .addCase(
        getRolesThunk.rejected,
        (state, action) => {
          state.error =
            action.payload ??
            'دریافت نقش‌ها انجام نشد.';
        },
      );

    builder
      .addCase(
        logoutThunk.pending,
        (state) => {
          state.loading = true;
        },
      )
      .addCase(
        logoutThunk.fulfilled,
        (state) => {
          state.token = null;
          state.userDetail = null;
          state.roles = null;
          state.isAuthenticated = false;
          state.loading = false;
          state.error = null;
        },
      );
  },
});

export const {
  clearAuth,
  updateToken,
  clearAuthError,
} = authSlice.actions;

interface AuthListenerStore {
  dispatch: (
    action: ReturnType<typeof clearAuth>,
  ) => unknown;
}

export const setupAuthListener = (
  store: AuthListenerStore,
): void => {
  setAuthFailureCallback(() => {
    store.dispatch(clearAuth());

    if (typeof window === 'undefined') {
      return;
    }

    if (
      window.location.pathname === '/login'
    ) {
      return;
    }

    const callbackUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );

    window.location.assign(
      `/login?callbackUrl=${callbackUrl}`,
    );
  });
};

export default authSlice.reducer;
