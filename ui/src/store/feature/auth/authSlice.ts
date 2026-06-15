import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDetail } from '@/models/user/UserDetail';
import { UserRole } from '@/models/user/UserRole';
import { AuthResponse } from '@/models/auth/AuthResponse';
import { loginThunk, getMeThunk, getRolesThunk, logoutThunk } from './authThunks';
import { setAuthFailureCallback } from '@/services/api/common/axiosInstance';

export interface AuthState {
  userDetail: UserDetail | null;     
  roles: UserRole | null;            
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { userDetail: null, roles: null, token: null, isAuthenticated: false, loading: false, error: null };
  }

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  
  let parsedUser: UserDetail | null = null;
  if (userJson) {
    try { parsedUser = JSON.parse(userJson); } catch (e) { console.error(e); }
  }

  return {
    token: token || null,
    userDetail: parsedUser,
    roles: null,
    isAuthenticated: !!token && !!parsedUser,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.userDetail = null;
      state.roles = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    // --- Login Thunk ---
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true; 
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // --- Get Me Thunk ---
    builder
      .addCase(getMeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMeThunk.fulfilled, (state, action: PayloadAction<UserDetail>) => {
        state.loading = false;
        state.userDetail = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.userDetail = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      });

    // --- Logout Thunk ---
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.userDetail = null;
        state.roles = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearAuth, updateToken } = authSlice.actions;

// ⭐ ستاپ listener برای auth failure
export const setupAuthListener = (store: any) => {
  setAuthFailureCallback(() => {
    store.dispatch(clearAuth());
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  });
};

export default authSlice.reducer;