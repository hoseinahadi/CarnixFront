'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';

import { makeStore, type AppStore } from '@/store';
import { hydrateAuth } from '@/store/feature/auth/authSlice';
import { setupAuthListener } from '@/store/setupAuthListener';
import {
  getAccessToken,
  getUserSnapshot,
  removeLegacyTokenArtifacts,
} from '@/services/api/common/authTokenStorage';
import { setRequestCacheIdentity } from '@/services/api/common/requestCache';

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
    removeLegacyTokenArtifacts();
    const userDetail = getUserSnapshot();
    setRequestCacheIdentity(userDetail ? `user:${userDetail.userId}` : 'anonymous');
    store.dispatch(
      hydrateAuth({
        token: getAccessToken(),
        userDetail,
      }),
    );

    // cleanup برای جلوگیری از انباشته‌شدن listenerها در HMR/Remount.
    return setupAuthListener(store);
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
