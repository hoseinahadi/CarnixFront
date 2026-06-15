    'use client';
    import { useRef } from 'react';
    import { Provider } from 'react-redux';
    import { store } from '@/store'; // آدرس فایل index.ts در پوشه store

    export default function StoreProvider({
      children,
    }: {
      children: React.ReactNode;
    }) {
      // این بخش برای اطمینان از ساخته شدن یک نمونه store در هر درخواست سرور است
      const storeRef = useRef(store);

      return <Provider store={storeRef.current}>{children}</Provider>;
    }
