'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';

import { makeStore, type AppStore } from '@/store';
import { hydrateAuth } from '@/store/feature/auth/authSlice';
import { setupAuthListener } from '@/store/setupAuthListener';
import {
  getAccessToken,
  getUserSnapshot,
} from '@/services/api/common/authTokenStorage';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    // فقط بعد از hydration مرورگر Storage خوانده می‌شود؛ SSR و اولین Client Render یکسان می‌مانند.
    store.dispatch(
      hydrateAuth({
        token: getAccessToken(),
        userDetail: getUserSnapshot(),
      }),
    );

    // cleanup برای جلوگیری از انباشته‌شدن listenerها در HMR/Remount.
    return setupAuthListener(store);
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
