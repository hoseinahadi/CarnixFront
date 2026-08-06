import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupAuthListener } from './feature/auth/authSlice';

// ⭐ به جای ساختن یک استور ثابت، یک تابع سازنده تعریف می‌کنیم
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
  });

  // ستاپ listener برای هر اینستنس از استور به صورت مجزا
  setupAuthListener(store);

  return store;
};

// ⭐ استخراج تایپ‌ها بر اساس تابع سازنده (آپدیت شده)
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];