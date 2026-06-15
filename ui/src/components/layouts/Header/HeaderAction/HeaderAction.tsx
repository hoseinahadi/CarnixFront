'use client'

import React, { useEffect, useRef, useState } from 'react'
import { IconButton, Badge } from '@mui/material'
import {
  IconShoppingCart,
  IconUser,
  IconLogout,
  IconSettings,
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

import { AppDispatch, RootState } from '@/store'
import { fetchMyCart } from '@/store/feature/cart/cartThunks'
import { logoutThunk } from '@/store/feature/auth/authThunks'
import CartDropdown from '@/features/cart/components/CartDropdown/CartDropdown'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/* -------------------------------------------------------------------------- */
/*                             FloatingDropdown                               */
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
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({
        mainAxis: 22,
        crossAxis: 50,
      }),
      arrow({
        element: arrowRef,
        padding: 10,
      }),
      flip({ fallbackAxisSideDirection: 'end' }),
      shift({ padding: 8 }),
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
        style={floatingStyles}
        className={styles.dropdown}
      >
        <FloatingArrow 
          ref={arrowRef} 
          context={context} 
          fill="#ffffff"
          width={14}
          height={7}
        />
        <div className={styles.popoverPaper}>{children}</div>
      </div>
    </FloatingPortal>
  )
}

/* -------------------------------------------------------------------------- */
/*                               HeaderAction                                 */
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

  // fetch cart only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyCart())
    }
  }, [dispatch, isAuthenticated])

  // refresh cart when tab becomes visible
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

  const closeAll = () => {
    setCartAnchorEl(null)
    setUserAnchorEl(null)
  }

  const handleUserClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setUserAnchorEl(event.currentTarget)
  }

  const handleLogout = async () => {
    closeAll()
    await dispatch(logoutThunk())
    router.push('/')
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

      {isAuthenticated && userDetail && userAnchorEl && (
        <FloatingDropdown anchorEl={userAnchorEl} onClose={closeAll}>
          <div className={styles.popoverContentSmall}>
            <div className={styles.popoverTitle}>
              {userDetail.firstName || userDetail.lastName
                ? `${userDetail.firstName || ''} ${userDetail.lastName || ''}`
                : 'کاربر عزیز'}
            </div>

            <div className={styles.popoverText}>
              {userDetail.phoneNumber ||
                userDetail.email ||
                'اطلاعات تماس نامشخص'}
            </div>

            <div className={styles.divider}></div>

            <button
              className={styles.menuItem}
              onClick={() => {
                closeAll()
                router.push('/profile')
              }}
            >
              <IconSettings size={18} />
              پروفایل من
            </button>

            <button
              className={`${styles.menuItem} ${styles.danger}`}
              onClick={handleLogout}
            >
              <IconLogout size={18} />
              خروج از حساب
            </button>
          </div>
        </FloatingDropdown>
      )}
    </div>
  )
}

export default HeaderAction