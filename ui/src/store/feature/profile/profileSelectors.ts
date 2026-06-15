import { RootState } from '@/store';

export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileUpdating = (state: RootState) => state.profile.updating;
export const selectProfileChangingPassword = (state: RootState) => state.profile.changingPassword;
export const selectProfileUploadingAvatar = (state: RootState) => state.profile.uploadingAvatar;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileSuccessMessage = (state: RootState) => state.profile.successMessage;

// سلکتورهای محاسباتی
export const selectUserFullName = (state: RootState) => {
  const profile = state.profile.data;
  if (!profile) return '';
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
};

export const selectUserAvatar = (state: RootState) => {
  return state.profile.data?.avatarUrl || state.profile.data?.userProfile?.avatarUrl || '';
};