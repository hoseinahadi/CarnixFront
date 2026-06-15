// src/components/auth/AuthGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { getMeThunk } from '@/store/feature/auth/authThunks'

// کامپوننت‌های MUI حذف شدند و از استایل ساده استفاده می‌کنیم

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token, loading, userDetail } = useAppSelector((s: RootState) => s.auth)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    if (!token) {
      router.replace('/login')
      return
    }

    if (isAuthenticated && !userDetail) {
      dispatch(getMeThunk())
    }
  }, [token, isAuthenticated, userDetail, isClient, router, dispatch])

  // استفاده از HTML ساده به جای کامپوننت‌های MUI
  if (!isClient || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (isAuthenticated && userDetail) {
    return <>{children}</>
  }
  
  return null
}
