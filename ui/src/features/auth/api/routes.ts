import { AuthResponse } from "@/models/auth/AuthResponse";
import { LoginRequest } from "@/models/auth/LoginRequest";
import { OperationResult } from "@/models/common/OperationResult";
import { UserDetail } from "@/models/user/UserDetail";
import { UserRole } from "@/models/user/UserRole";
import axiosInstance from "@/services/api/common/axiosInstance";

export const authApi = {
    //ورود کاربر 
    login: async (credentials: LoginRequest) =>
    await axiosInstance.post<OperationResult<AuthResponse>>('/Auth/login', credentials),

  // دریافت اطلاعات کاربر فعلی
  getMe: async () =>
    await axiosInstance.get<OperationResult<UserDetail>>('/Auth/me'),

  // دریافت نقش‌های کاربر
  getRoles: async () =>
    await axiosInstance.get<OperationResult<UserRole>>('/Auth/roles'),

  // عملیات خروج
  logout: async () =>
    await axiosInstance.post('/Auth/logout'),
};