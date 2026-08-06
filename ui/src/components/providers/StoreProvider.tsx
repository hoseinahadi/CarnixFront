'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🟢 تعیین نوع صریح با AppStore | null
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // 🟢 استفاده از علامت تعجب (!) در انتهای storeRef.current
  // این کار به تایپ‌اسکریپت می‌فهماند که: "نگران نباش، من مطمئنم اینجا استور خالی نیست!"
  return <Provider store={storeRef.current!}>{children}</Provider>;
}