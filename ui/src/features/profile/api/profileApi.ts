import axiosClient from '@/services/api/common/axiosClient';
import { OperationResult } from '@/models/common/OperationResult';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  bio?: string;
  nationalCode?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const profileApi = {
  // دریافت پروفایل کاربر
  getMyProfile: async () =>
    await axiosClient.get('/Profile/me'),

  // آپدیت پروفایل
  updateProfile: async (data: UpdateProfileRequest) =>
    await axiosClient.put('/Profile/update', data),

  // تغییر رمز عبور
  changePassword: async (data: ChangePasswordRequest) =>
    await axiosClient.post('/Profile/change-password', data),

  // آپلود آواتار
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosClient.post('/Profile/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // حذف آواتار
  deleteAvatar: async () =>
    await axiosClient.delete('/Profile/delete-avatar'),
};