import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

/**
 * ساخت Store باید بدون side-effect باشد. Listenerهای مرورگر در StoreProvider
 * نصب و در cleanup حذف می‌شوند تا HMR/Remount باعث memory leak نشود.
 */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
