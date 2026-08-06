/**
 * شکل خام پاسخ Token از بک‌اند.
 * بعضی نسخه‌های API از token و بعضی از accessToken استفاده می‌کنند.
 */
export interface AuthTokenPayload {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

/**
 * شکل نرمال‌شده‌ای که داخل Redux استفاده می‌شود.
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  message?: string;
}
