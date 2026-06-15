import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi, UpdateProfileRequest, ChangePasswordRequest } from '@/features/profile/api/profileApi';
import { AxiosError } from 'axios';

// دریافت پروفایل کاربر
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getMyProfile();
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت پروفایل');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// آپدیت پروفایل
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(data);
      if (response.data.isSuccess) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'خطا در بروزرسانی پروفایل');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// تغییر رمز عبور
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await profileApi.changePassword(data);
      if (response.data.isSuccess) {
        return response.data.message;
      }
      return rejectWithValue(response.data.message || 'خطا در تغییر رمز عبور');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// آپلود آواتار
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await profileApi.uploadAvatar(file);
      if (response.data.isSuccess) {
        return response.data.data.avatarUrl;
      }
      return rejectWithValue(response.data.message || 'خطا در آپلود آواتار');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

// حذف آواتار
export const deleteAvatar = createAsyncThunk(
  'profile/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.deleteAvatar();
      if (response.data.isSuccess) {
        return true;
      }
      return rejectWithValue(response.data.message || 'خطا در حذف آواتار');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);