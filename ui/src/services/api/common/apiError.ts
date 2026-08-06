import axios from 'axios';

import type { OperationResult } from '@/models/common/OperationResult';

export type ApiValidationErrors =
  | string[]
  | Record<string, string[]>;

interface BackendErrorPayload {
  message?: unknown;
  title?: unknown;
  detail?: unknown;
  errors?: unknown;
  statusCode?: unknown;
}

export class ApiBusinessError extends Error {
  public readonly statusCode: number | null;
  public readonly validationErrors: ApiValidationErrors | null;

  constructor(
    message: string,
    statusCode: number | null = null,
    validationErrors: ApiValidationErrors | null = null,
  ) {
    super(message);

    this.name = 'ApiBusinessError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isValidationErrors = (
  value: unknown,
): value is ApiValidationErrors => {
  if (Array.isArray(value)) {
    return value.every(
      (item) => typeof item === 'string',
    );
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) =>
      Array.isArray(item) &&
      item.every(
        (message) => typeof message === 'string',
      ),
  );
};

const readString = (
  value: unknown,
): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
};

const readStatusCode = (
  value: unknown,
): number | null => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return null;
};

const getBackendPayload = (
  value: unknown,
): BackendErrorPayload | null => {
  if (!isRecord(value)) {
    return null;
  }

  return value as BackendErrorPayload;
};

export const isOperationResult = <T>(
  value: unknown,
): value is OperationResult<T> =>
  isRecord(value) &&
  typeof value.isSuccess === 'boolean' &&
  'data' in value;

/**
 * بعضی Endpointهای فعلی OperationResult<T> برمی‌گردانند و بعضی دیگر
 * داده را مستقیم برمی‌گردانند. این تابع هر دو قرارداد را پشتیبانی می‌کند.
 */
export function unwrapOperationResult<T>(
  payload: OperationResult<T> | T,
  fallbackMessage = 'عملیات با خطا مواجه شد.',
): T {
  if (!isOperationResult<T>(payload)) {
    return payload as T;
  }

  if (!payload.isSuccess) {
    throw new ApiBusinessError(
      readString(payload.message) ?? fallbackMessage,
      readStatusCode(payload.statusCode),
      isValidationErrors(payload.errors)
        ? payload.errors
        : null,
    );
  }

  return payload.data;
}

export const isRequestCanceled = (
  error: unknown,
): boolean =>
  axios.isCancel(error) ||
  (
    axios.isAxiosError(error) &&
    error.code === 'ERR_CANCELED'
  );

export const getApiValidationErrors = (
  error: unknown,
): ApiValidationErrors | null => {
  if (error instanceof ApiBusinessError) {
    return error.validationErrors;
  }

  if (!axios.isAxiosError(error)) {
    return null;
  }

  const payload = getBackendPayload(
    error.response?.data,
  );

  return isValidationErrors(payload?.errors)
    ? payload.errors
    : null;
};

const flattenValidationErrors = (
  errors: ApiValidationErrors | null,
): string | null => {
  if (!errors) {
    return null;
  }

  const messages = Array.isArray(errors)
    ? errors
    : Object.values(errors).flat();

  const uniqueMessages = [
    ...new Set(
      messages
        .map((message) => message.trim())
        .filter(Boolean),
    ),
  ];

  return uniqueMessages.length > 0
    ? uniqueMessages.join('، ')
    : null;
};

/**
 * پیام مناسب نمایش به کاربر تولید می‌کند و اطلاعات داخلی خطاهای 5xx
 * یا Stack Trace بک‌اند را نمایش نمی‌دهد.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
): string {
  if (error instanceof ApiBusinessError) {
    return (
      flattenValidationErrors(
        error.validationErrors,
      ) ?? error.message
    );
  }

  if (isRequestCanceled(error)) {
    return 'درخواست لغو شد.';
  }

  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return error.message || fallbackMessage;
    }

    if (typeof error === 'string') {
      return error || fallbackMessage;
    }

    return fallbackMessage;
  }

  if (
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT'
  ) {
    return 'زمان پاسخ‌گویی سرور بیش از حد طول کشید. دوباره تلاش کنید.';
  }

  if (!error.response) {
    return 'ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.';
  }

  const status = error.response.status;
  const payload = getBackendPayload(
    error.response.data,
  );

  const validationMessage =
    flattenValidationErrors(
      isValidationErrors(payload?.errors)
        ? payload.errors
        : null,
    );

  const backendMessage =
    readString(payload?.message) ??
    readString(payload?.title) ??
    readString(payload?.detail);

  switch (status) {
    case 400:
      return (
        validationMessage ??
        backendMessage ??
        'اطلاعات ارسال‌شده معتبر نیست.'
      );

    case 401:
      return 'نشست کاربری منقضی شده است. دوباره وارد حساب خود شوید.';

    case 403:
      return 'شما اجازه انجام این عملیات را ندارید.';

    case 404:
      return backendMessage ?? 'اطلاعات موردنظر پیدا نشد.';

    case 409:
      return (
        backendMessage ??
        'اطلاعات تغییر کرده یا این عملیات قبلاً انجام شده است.'
      );

    case 422:
      return (
        validationMessage ??
        backendMessage ??
        'اطلاعات واردشده نیاز به اصلاح دارد.'
      );

    case 429:
      return 'تعداد درخواست‌ها زیاد است. چند لحظه بعد دوباره تلاش کنید.';

    default:
      if (status >= 500) {
        return 'در پردازش درخواست در سرور خطایی رخ داد. کمی بعد دوباره تلاش کنید.';
      }

      return backendMessage ?? fallbackMessage;
  }
}

export const isDefinitiveAuthenticationError = (
  error: unknown,
): boolean => {
  if (error instanceof ApiBusinessError) {
    return [400, 401, 403].includes(
      error.statusCode ?? 0,
    );
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  return [400, 401, 403].includes(
    error.response?.status ?? 0,
  );
};
