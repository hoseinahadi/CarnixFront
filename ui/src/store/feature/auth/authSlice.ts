import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { AuthResponse } from '@/models/auth/AuthResponse';
import type { UserDetail } from '@/models/user/UserDetail';
import type { UserRole } from '@/models/user/UserRole';

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
  /**
   * false روی SSR و اولین رندر کلاینت است تا HTML اولیه دقیقاً یکسان بماند.
   * StoreProvider بعد از mount اطلاعات storage را hydrate می‌کند.
   */
  initialized: boolean;
  meLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  userDetail: null,
  roles: null,
  isAuthenticated: false,
  initialized: false,
  meLoading: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    hydrateAuth: (
      state,
      action: PayloadAction<{
        token: string | null;
        userDetail: UserDetail | null;
      }>,
    ) => {
      state.token = action.payload.token;
      state.userDetail = action.payload.userDetail;
      state.isAuthenticated = Boolean(action.payload.token);
      state.initialized = true;
      state.error = null;
    },

    clearAuth: (state) => {
      state.token = null;
      state.userDetail = null;
      state.roles = null;
      state.isAuthenticated = false;
      state.initialized = true;
      state.meLoading = false;
      state.loading = false;
      state.error = null;
    },

    updateToken: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.initialized = true;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = null;

        const token = action.payload.token ?? action.payload.accessToken;
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? 'ثبت‌نام انجام نشد.';
      });

    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.initialized = true;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? 'ورود انجام نشد.';
        state.isAuthenticated = false;
      });

    builder
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = null;

        const token = action.payload.token ?? action.payload.accessToken;
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? 'تأیید کد انجام نشد.';
      });

    builder
      .addCase(getMeThunk.pending, (state) => {
        state.meLoading = true;
      })
      .addCase(
        getMeThunk.fulfilled,
        (state, action: PayloadAction<UserDetail>) => {
          state.meLoading = false;
          state.userDetail = action.payload;
          state.isAuthenticated = true;
          state.initialized = true;
        },
      )
      .addCase(getMeThunk.rejected, (state, action) => {
        state.meLoading = false;
        // خطای getMe نباید پیام فرم Login/Register را overwrite کند.
        if (!state.error) {
          state.error = action.payload ?? 'دریافت اطلاعات کاربر انجام نشد.';
        }
      });

    builder
      .addCase(getRolesThunk.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      .addCase(getRolesThunk.rejected, (state, action) => {
        if (!state.error) {
          state.error = action.payload ?? 'دریافت نقش‌ها انجام نشد.';
        }
      });

    builder
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.userDetail = null;
        state.roles = null;
        state.isAuthenticated = false;
        state.initialized = true;
        state.meLoading = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const {
  hydrateAuth,
  clearAuth,
  updateToken,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
