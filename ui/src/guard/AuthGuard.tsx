'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import { useAppDispatch } from '@/store/hooks';
import { useAppSelector } from '@/store/hooks';

import {
  getMeThunk,
} from '@/store/feature/auth/authThunks';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const hasRequestedUserRef =
    useRef(false);

  const {
    token,
    loading,
    userDetail,
  } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    hasRequestedUserRef.current = false;
  }, [token]);

  useEffect(() => {
    if (
      !token ||
      userDetail ||
      loading ||
      hasRequestedUserRef.current
    ) {
      return;
    }

    hasRequestedUserRef.current = true;
    void dispatch(getMeThunk());
  }, [
    token,
    userDetail,
    loading,
    dispatch,
  ]);

  useEffect(() => {
    if (token || loading) {
      return;
    }

    const callbackUrl =
      encodeURIComponent(
        pathname || '/profile',
      );

    router.replace(
      `/login?callbackUrl=${callbackUrl}`,
    );
  }, [
    token,
    loading,
    pathname,
    router,
  ]);

  if (loading && !userDetail) {
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
            animation:
              'auth-guard-spin 1s linear infinite',
          }}
        />

        <style>{`
          @keyframes auth-guard-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
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
