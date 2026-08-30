import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchMyProfile, 
  updateProfile, 
  changePassword, 
  uploadAvatar, 
  deleteAvatar 
} from './profileThunks';

interface ProfileState {
  data: any | null;
  loading: boolean;
  updating: boolean;
  changingPassword: boolean;
  uploadingAvatar: boolean;
  error: string | null;
  successMessage: string | null;
  lastFetchedAt: number | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  updating: false,
  changingPassword: false,
  uploadingAvatar: false,
  error: null,
  successMessage: null,
  lastFetchedAt: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.lastFetchedAt = null;
    },
    clearProfileState: (state) => {
      state.data = null;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch My Profile ───
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── Update Profile ───
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.data = action.payload;
        state.lastFetchedAt = Date.now();
        state.successMessage = 'پروفایل با موفقیت بروزرسانی شد.';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // ─── Change Password ───
    builder
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changingPassword = false;
        state.successMessage = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changingPassword = false;
        state.error = action.payload as string;
      });

    // ─── Upload Avatar ───
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.data?.userProfile) {
          state.data.userProfile.avatarUrl = action.payload;
        }
        state.successMessage = 'آواتار با موفقیت آپلود شد.';
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });

    // ─── Delete Avatar ───
    builder
      .addCase(deleteAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(deleteAvatar.fulfilled, (state) => {
        state.uploadingAvatar = false;
        if (state.data?.userProfile) {
          state.data.userProfile.avatarUrl = '';
        }
        state.successMessage = 'آواتار با موفقیت حذف شد.';
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileMessages, clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;