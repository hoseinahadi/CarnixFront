'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getMeThunk } from '@/store/feature/auth/authThunks';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const {
    token,
    initialized,
    meLoading,
    userDetail,
  } = useAppSelector((state) => state.auth);

  // از retry-loop روی خطای getMe جلوگیری می‌کند. برای هر token فقط یک
  // درخواست خودکار در طول عمر این Guard انجام می‌شود.
  const requestedMeTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      requestedMeTokenRef.current = null;
      return;
    }

    if (
      !initialized ||
      userDetail ||
      meLoading ||
      requestedMeTokenRef.current === token
    ) {
      return;
    }

    requestedMeTokenRef.current = token;
    void dispatch(getMeThunk());
  }, [initialized, token, userDetail, meLoading, dispatch]);

  useEffect(() => {
    if (!initialized || token) {
      return;
    }

    const callbackUrl = encodeURIComponent(pathname || '/profile');
    router.replace(`/login?callbackUrl=${callbackUrl}`);
  }, [initialized, token, pathname, router]);

  if (!initialized || (token && meLoading && !userDetail)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          aria-label="در حال دریافت اطلاعات کاربر"
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'auth-guard-spin 1s linear infinite',
          }}
        />

        <style>{`
          @keyframes auth-guard-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
