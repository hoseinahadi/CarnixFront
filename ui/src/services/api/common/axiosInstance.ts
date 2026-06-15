import axios, { AxiosError } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7191/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Helper Functions ────────────────────────────────────────────

const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;

  let sessionId = localStorage.getItem('sessionId');
  
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sess_' + Date.now() + Math.random().toString(36).substring(2);
      
    localStorage.setItem('sessionId', sessionId);
  }
  
  return sessionId;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// ⭐ ذخیره callback برای آپدیت state
let onAuthFailure: (() => void) | null = null;

export const setAuthFailureCallback = (callback: () => void) => {
  onAuthFailure = callback;
};

// ⭐ تابع کمکی برای استخراج توکن از localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const saveTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ─── Request Interceptor ─────────────────────────────────────────

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `ApiToken ${token}`;
    }
  }

  const sessionId = getOrCreateSessionId();
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId; 
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ─── Response Interceptor (رفرش توکن) ────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // اگه خطا 401 نبود
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // اگه قبلاً retry شده
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // اگه خودش درخواست لاگین یا رفرش توکن باشه
    if (
      originalRequest.url?.includes('/Auth/login') || 
      originalRequest.url?.includes('/Auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // اگه اصلاً توکن نداره (کاربر مهمان)
    if (!originalRequest.headers?.Authorization) {
      return Promise.reject(error);
    }

    // اگه قبلاً یه رفرش در حال انجامه، صبر می‌کنیم
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers['Authorization'] = `ApiToken ${token}`;
        originalRequest._retry = true;
        return axiosInstance(originalRequest);
      }).catch((err) => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      const currentToken = getToken();
      
      // ⭐ اگه refreshToken نداریم، یعنی اصلاً نمیتونیم رفرش کنیم
      if (!refreshToken || !currentToken) {
        clearTokens();
        if (onAuthFailure) onAuthFailure();
        return Promise.reject(error);
      }

      // ⭐ تلاش برای رفرش توکن
      const response = await axios.post(
        `${axiosInstance.defaults.baseURL}/Auth/refresh`,
        { 
          accessToken: currentToken, 
          refreshToken: refreshToken 
        }
      );

      // ⭐ بررسی ساختار پاسخ (انعطاف‌پذیر)
      const data = response.data;
      
      const newAccessToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const newRefreshToken = data.refreshToken || data.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error('Invalid refresh token response');
      }
      
      // ذخیره توکن‌های جدید
      saveTokens(newAccessToken, newRefreshToken);

      // آپدیت هدر درخواست اصلی
      originalRequest.headers['Authorization'] = `ApiToken ${newAccessToken}`;

      // پردازش صف درخواست‌های منتظر
      processQueue(null, newAccessToken);

      // ⭐ ریتست درخواست اصلی
      return axiosInstance(originalRequest);
      
    } catch (refreshError: any) {
      // رفرش توکن ناموفق
      
      // ⭐ اگه خطای 400 یا 401 بود، یعنی رفرش توکن هم منقضی شده
      if (refreshError?.response?.status === 400 || refreshError?.response?.status === 401) {
        clearTokens();
        
        // ⭐ صدا زدن callback برای آپدیت ریداکس
        if (onAuthFailure) {
          onAuthFailure();
        } else {
          // fallback: ریدایرکت مستقیم
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      
      // reject تمام درخواست‌های توی صف
      processQueue(refreshError as AxiosError, null);
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;