import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi, UpdateProfileRequest, ChangePasswordRequest } from '@/features/profile/api/profileApi';

const PROFILE_CACHE_TTL_MS = 60_000;

type ProfileFetchArgs = { force?: boolean } | undefined;
type ProfileRootState = {
  profile: {
    data: unknown | null;
    loading: boolean;
    lastFetchedAt: number | null;
  };
};

export const fetchMyProfile = createAsyncThunk<
  { data: any; fetchedAt: number },
  ProfileFetchArgs,
  { state: ProfileRootState; rejectValue: string }
>(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getMyProfile();
      if (response.data.isSuccess) {
        return { data: response.data.data, fetchedAt: Date.now() };
      }
      return rejectWithValue(response.data.message || 'خطا در دریافت پروفایل');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  },
  {
    condition: (args, { getState }) => {
      const state = getState().profile;
      if (state.loading) return false;
      if (args?.force) return true;
      if (!state.data || !state.lastFetchedAt) return true;
      return Date.now() - state.lastFetchedAt >= PROFILE_CACHE_TTL_MS;
    },
  },
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(data);
      if (response.data.isSuccess) return response.data.data;
      return rejectWithValue(response.data.message || 'خطا در بروزرسانی پروفایل');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await profileApi.changePassword(data);
      if (response.data.isSuccess) return response.data.message;
      return rejectWithValue(response.data.message || 'خطا در تغییر رمز عبور');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await profileApi.uploadAvatar(file);
      if (response.data.isSuccess) return response.data.data.avatarUrl;
      return rejectWithValue(response.data.message || 'خطا در آپلود آواتار');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'profile/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.deleteAvatar();
      if (response.data.isSuccess) return true;
      return rejectWithValue(response.data.message || 'خطا در حذف آواتار');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای شبکه');
    }
  }
);
