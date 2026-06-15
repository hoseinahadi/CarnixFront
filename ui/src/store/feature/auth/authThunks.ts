import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/features/auth/api/routes';
import { LoginRequest } from '@/models/auth/LoginRequest';
import { AuthResponse } from '@/models/auth/AuthResponse';
import { UserDetail } from '@/models/user/UserDetail';
import { UserRole } from '@/models/user/UserRole';
import { AxiosError } from 'axios';
import { OperationResult } from '@/models/common/OperationResult';
import { fetchMyCart } from '@/store/feature/cart/cartThunks';

// --- 1. دریافت اطلاعات کاربر فعلی (Get Me) ---
export const getMeThunk = createAsyncThunk<
  UserDetail, 
  void, 
  { rejectValue: string }
>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      const operationResult = response.data;
      
      if (!operationResult.isSuccess) {
        return rejectWithValue(operationResult.message || 'خطا در دریافت اطلاعات کاربر');
      }

      const fullUserData = operationResult.data;

      const essentialUserInfo = {
        id: fullUserData.userId ,
        userName: fullUserData.userName,
        firstName: fullUserData.firstName,
        lastName: fullUserData.lastName,
      };

      localStorage.setItem('user', JSON.stringify(essentialUserInfo));
      return fullUserData;
    } catch (err) {
      const error = err as AxiosError<OperationResult<null>>;
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه در دریافت اطلاعات کاربر');
    }
  }
);

// --- 2. لاگین (Login) ---
export const loginThunk = createAsyncThunk<
  AuthResponse, 
  LoginRequest, 
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      const data = response.data as any;
      if (!data.token) {
        return rejectWithValue(data.message || 'نام کاربری یا رمز عبور اشتباه است.');
      }
      
      // 1. ذخیره توکن‌ها
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // 2. دریافت اطلاعات کاربر
      await dispatch(getMeThunk()).unwrap();
      
      // 3. ⭐ دریافت سبد خرید بعد از لاگین موفق
      try {
        await dispatch(fetchMyCart()).unwrap();
      } catch (cartError) {
        console.error('Failed to fetch cart after login:', cartError);
      }
      
      return {
        token: data.token,
        message: data.message
      };
    } catch (err) {
      if (typeof err === 'string') return rejectWithValue(err);
      
      const error = err as AxiosError<any>;
      return rejectWithValue(error.response?.data?.message || 'نام کاربری یا رمز عبور اشتباه است');
    }
  }
);

// --- 3. دریافت نقش‌های کاربر ---
export const getRolesThunk = createAsyncThunk<
  UserRole, 
  void, 
  { rejectValue: string }
>(
  'auth/getRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getRoles();
      const operationResult = response.data;

      if (!operationResult.isSuccess) {
        return rejectWithValue(operationResult.message || 'خطا در دریافت نقش‌ها');
      }

      return operationResult.data;
    } catch (err) {
      const error = err as AxiosError<OperationResult<null>>;
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه در دریافت نقش‌ها');
    }
  }
);

// --- 4. خروج (Logout) ---
export const logoutThunk = createAsyncThunk<
  void, 
  void, 
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
);