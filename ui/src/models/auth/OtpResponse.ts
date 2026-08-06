import type {
  AuthTokenPayload,
} from '@/models/auth/AuthResponse';

export interface SendOtpResponse {
  message?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpResponse
  extends AuthTokenPayload {
  message: string;
  isRegistered: boolean;
}
