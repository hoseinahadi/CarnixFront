import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupAuthListener } from './feature/auth/authSlice';

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// ⭐ ستاپ listener برای auth failure (رفرش توکن ناموفق)
setupAuthListener(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;