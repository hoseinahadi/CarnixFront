'use client'

import { useEffect, useRef } from 'react'
import { getRolesThunk } from '@/store/feature/auth/authThunks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/**
 * نقش مکانیک را از API می‌خواند تا نمایش پنل و دسترسی صفحه با نقش واقعی کاربر
 * هماهنگ باشد. لیست عمومی مکانیک‌ها از این hook استفاده نمی‌کند.
 */
export function useHasMechanicRole() {
  const dispatch = useAppDispatch()
  const { initialized, isAuthenticated, token, roles, rolesLoading } = useAppSelector((state) => state.auth)
  const requestedToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token) {
      requestedToken.current = null
      return
    }

    if (initialized && isAuthenticated && !roles && !rolesLoading && requestedToken.current !== token) {
      requestedToken.current = token
      void dispatch(getRolesThunk())
    }
  }, [dispatch, initialized, isAuthenticated, roles, rolesLoading, token])

  return Boolean(
    roles?.roleNames?.some((name) => name.trim().toLowerCase() === 'mechanic'),
  )
}
