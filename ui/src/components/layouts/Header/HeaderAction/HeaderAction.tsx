// src/components/common/HeaderAction/HeaderAction.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { IconButton, Badge } from '@mui/material'
import {
  IconShoppingCart,
  IconUser,
  IconLogout,
  IconSettings,
  IconPackage,
  IconHeart,
  IconMapPin,
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import styles from './HeaderAction.module.scss'

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useTransitionStyles,
  FloatingArrow,
  arrow
} from '@floating-ui/react'

import { fetchMyCart } from '@/store/feature/cart/cartThunks'
import { logoutThunk } from '@/store/feature/auth/authThunks'
import CartDropdown from '@/features/cart/components/CartDropdown/CartDropdown'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/* -------------------------------------------------------------------------- */
/* FloatingDropdown                                                           */
/* -------------------------------------------------------------------------- */

interface FloatingDropdownProps {
  anchorEl: HTMLElement
  onClose: () => void
  children: React.ReactNode
}

const FloatingDropdown = ({
  anchorEl,
  onClose,
  children,
}: FloatingDropdownProps) => {
  const arrowRef = useRef<SVGSVGElement>(null)
  const { refs, floatingStyles, context } = useFloating({
    open: true,
    strategy: 'fixed',
    elements: {
      reference: anchorEl,
    },
    onOpenChange: (open) => {
      if (!open) onClose()
    },
    placement: 'bottom-end', // مناسب برای زبان فارسی (RTL) تا مدال از لبه چپ بیرون نزند
    whileElementsMounted: autoUpdate,
    middleware: [
      // ✅ crossAxis حذف شد تا در موبایل مدال از آیکون جدا نشود
      offset({
        mainAxis: 16, // فاصله عمودی از دکمه
      }),
      flip({ fallbackAxisSideDirection: 'end' }),
      shift({ padding: 16 }), // ✅ حاشیه امن 16 پیکسلی از لبه‌های صفحه در موبایل
      arrow({
        element: arrowRef,
        padding: 12, // جلوگیری از چسبیدن فلش به گوشه‌های گرد مدال
      }),
    ],
  })
  
  const dismiss = useDismiss(context)
  const role = useRole(context)
  const { getFloatingProps } = useInteractions([dismiss, role])

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: 'translateY(-8px)',
    },
  })

  if (!isMounted) return null

  return (
    <FloatingPortal root={document.body}>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: 1100 }} // تضمین قرارگیری روی سایر عناصر
        className={styles.dropdown}
        {...getFloatingProps()}
      >
        <div style={transitionStyles}>
          <FloatingArrow 
            ref={arrowRef} 
            context={context} 
            fill="#ffffff"
            width={14}
            height={7}
            style={{
              transform: 'translateY(-1px)' // رفع خطای بصری بین فلش و حاشیه مدال
            }}
          />
          <div className={styles.popoverPaper}>{children}</div>
        </div>
      </div>
    </FloatingPortal>
  )
}

/* -------------------------------------------------------------------------- */
/* HeaderAction                                                               */
/* -------------------------------------------------------------------------- */

const HeaderAction = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { cart, loading: cartLoading } = useAppSelector(
    (state) => state.cart
  )
  const { isAuthenticated, userDetail } = useAppSelector(
    (state) => state.auth
  )

  const [cartAnchorEl, setCartAnchorEl] =
    useState<HTMLButtonElement | null>(null)
  const [userAnchorEl, setUserAnchorEl] =
    useState<HTMLButtonElement | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    
      dispatch(fetchMyCart())
    
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchMyCart())
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && !userDetail?.phoneNumber && !userDetail?.email) {
      console.log('User info might need refresh')
    }
  }, [isAuthenticated, userDetail])

  const closeAll = () => {
    setCartAnchorEl(null)
    setUserAnchorEl(null)
    setIsUserMenuOpen(false)
  }

  const handleUserClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setIsUserMenuOpen(!isUserMenuOpen)
    setUserAnchorEl(event.currentTarget)
  }

  const handleLogout = async () => {
    closeAll()
    await dispatch(logoutThunk())
    router.push('/')
  }

  const getInitials = () => {
    if (userDetail?.firstName || userDetail?.lastName) {
      const firstInitial = userDetail.firstName ? userDetail.firstName.charAt(0) : ''
      const lastInitial = userDetail.lastName ? userDetail.lastName.charAt(0) : ''
      return `${firstInitial}${lastInitial}`.toUpperCase() || <IconUser size={24} stroke={1.5} />
    }
    return <IconUser size={24} stroke={1.5} />
  }

  const getUserDisplayInfo = () => {
    if (userDetail?.phoneNumber) return userDetail.phoneNumber
    if (userDetail?.email) return userDetail.email
    return 'اطلاعات تماس ثبت نشده'
  }

  const getUserDisplayName = () => {
    if (userDetail?.firstName || userDetail?.lastName) {
      return `${userDetail.firstName || ''} ${userDetail.lastName || ''}`.trim()
    }
    return 'کاربر عزیز'
  }

  return (
    <div className={styles.actionsContainer}>
      {/* ------------------------------- Cart -------------------------------- */}
      <IconButton
        aria-label="cart"
        onClick={(e) => setCartAnchorEl(e.currentTarget)}
        className={styles.iconButton}
      >
        <Badge badgeContent={cart?.totalItemsCount || 0} color="primary">
          <IconShoppingCart size={24} stroke={1.5} />
        </Badge>
      </IconButton>

      {cartAnchorEl && (
        <FloatingDropdown anchorEl={cartAnchorEl} onClose={closeAll}>
          <CartDropdown 
             cart={cart} 
             loading={cartLoading} 
             onClose={closeAll} 
          />
        </FloatingDropdown>
      )}

      {/* ------------------------------ User --------------------------------- */}
      <IconButton
        aria-label="user profile"
        onClick={handleUserClick}
        className={styles.iconButton}
      >
        <IconUser size={24} stroke={1.5} />
      </IconButton>

      {isAuthenticated && userDetail && isUserMenuOpen && userAnchorEl && (
        <FloatingDropdown anchorEl={userAnchorEl} onClose={closeAll}>
          <div className={styles.popoverContentSmall}>
            
            <div className={styles.userInfoHeader}>
              <div className={styles.avatar}>
                {getInitials()}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>
                  {getUserDisplayName()}
                </div>
                <div className={styles.userPhone}>
                  {getUserDisplayInfo()}
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.menuGroup}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  closeAll()
                  router.push('/profile/orders')
                }}
              >
                <IconPackage size={20} stroke={1.5} />
                سفارش‌های من
              </button>

              <button
                className={styles.menuItem}
                onClick={() => {
                  closeAll()
                  router.push('/profile/wishlist')
                }}
              >
                <IconHeart size={20} stroke={1.5} />
                علاقه‌مندی‌ها
              </button>

              <button
                className={styles.menuItem}
                onClick={() => {
                  closeAll()
                  router.push('/profile/addresses')
                }}
              >
                <IconMapPin size={20} stroke={1.5} />
                آدرس‌ها
              </button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.menuGroup}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  closeAll()
                  router.push('/profile')
                }}
              >
                <IconSettings size={20} stroke={1.5} />
                اطلاعات حساب کاربری
              </button>

              <button
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleLogout}
              >
                <IconLogout size={20} stroke={1.5} />
                خروج از حساب
              </button>
            </div>

          </div>
        </FloatingDropdown>
      )}
    </div>
  )
}

export default HeaderAction