import type {
  AxiosResponse,
} from 'axios';

import type {
  AuthTokenPayload,
} from '@/models/auth/AuthResponse';

import type {
  LoginRequest,
} from '@/models/auth/LoginRequest';

import type {
  SendOtpResponse,
  VerifyOtpResponse,
} from '@/models/auth/OtpResponse';

import type {
  RegisterRequest,
  RegisterResponse,
} from '@/models/auth/RegisterRequest';

import type {
  OperationResult,
} from '@/models/common/OperationResult';

import type {
  UserDetail,
} from '@/models/user/UserDetail';

import type {
  UserRole,
} from '@/models/user/UserRole';

import axiosClient from '@/services/api/common/axiosClient';

export type ApiResponsePayload<T> =
  | OperationResult<T>
  | T;

export const authApi = {
  sendOtp: (
    data: {
      phoneNumber: string;
    },
  ): Promise<
    AxiosResponse<
      ApiResponsePayload<SendOtpResponse>
    >
  > =>
    axiosClient.post(
      '/Auth/send-otp',
      data,
    ),

  verifyOtp: (
    data: {
      phoneNumber: string;
      code: string;
    },
  ): Promise<
    AxiosResponse<
      ApiResponsePayload<VerifyOtpResponse>
    >
  > =>
    axiosClient.post(
      '/Auth/verify-otp',
      data,
    ),

  register: (
    data: RegisterRequest,
  ): Promise<
    AxiosResponse<
      ApiResponsePayload<RegisterResponse>
    >
  > =>
    axiosClient.post(
      '/Auth/register',
      data,
    ),

  login: (
    credentials: LoginRequest,
  ): Promise<
    AxiosResponse<
      ApiResponsePayload<AuthTokenPayload>
    >
  > =>
    axiosClient.post(
      '/Auth/login',
      credentials,
    ),

  getMe: (): Promise<
    AxiosResponse<
      ApiResponsePayload<UserDetail>
    >
  > =>
    axiosClient.get('/Auth/me'),

  getRoles: (): Promise<
    AxiosResponse<
      ApiResponsePayload<UserRole>
    >
  > =>
    axiosClient.get('/Auth/roles'),

  logout: (): Promise<AxiosResponse<unknown>> =>
    axiosClient.post('/Auth/logout'),
};
