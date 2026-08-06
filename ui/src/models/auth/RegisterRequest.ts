import type {
  AuthTokenPayload,
} from '@/models/auth/AuthResponse';

export interface RegisterRequest {
  userName: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phoneNumber: string;
  name: string;
  family: string;
  roleName?: string;
  car?: string;
}

export interface RegisterResponse
  extends AuthTokenPayload {
  message: string;
  userId: number;
}
