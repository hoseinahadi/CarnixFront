'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  IconUser,
  IconShoppingBag,
  IconMapPin,
  IconHeart,
  IconMessageCircle,
  IconWallet,
  IconLogout,
  IconChevronLeft,
  IconArrowRight,
} from '@tabler/icons-react'
import { logoutThunk } from '@/store/feature/auth/authThunks'
import { selectUserFullName, selectProfile } from '@/store/feature/profile/profileSelectors'
import styles from './ProfileSidebar.module.scss'
import classNames from 'classnames'

const menuItems = [
  {
    title: 'اطلاعات حساب کاربری',
    icon: IconUser,
    path: '/profile/info',
  },
  {
    title: 'سفارش‌ها',
    icon: IconShoppingBag,
    path: '/profile/orders',
  },
  {
    title: 'آدرس‌ها',
    icon: IconMapPin,
    path: '/profile/addresses',
  },
  {
    title: 'علاقه‌مندی‌ها',
    icon: IconHeart,
    path: '/profile/wishlist',
  },
  {
    title: 'دیدگاه‌ها',
    icon: IconMessageCircle,
    path: '/profile/comments',
  },
]

const ProfileSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hideFloatingButton, setHideFloatingButton] = useState(false)
  // استیت مربوط به نمایش مدال خروج
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  
  // گرفتن اطلاعات از ریداکس
  const fullName = useAppSelector(selectUserFullName)
  const profile = useAppSelector(selectProfile)
  const phoneNumber = profile?.phoneNumber || ''

  // گوش دادن به event برای مخفی کردن دکمه شناور هنگام باز شدن مدال
  useEffect(() => {
    const handleHideButton = () => setHideFloatingButton(true)
    const handleShowButton = () => setHideFloatingButton(false)
    
    window.addEventListener('modalOpened', handleHideButton)
    window.addEventListener('modalClosed', handleShowButton)
    
    return () => {
      window.removeEventListener('modalOpened', handleHideButton)
      window.removeEventListener('modalClosed', handleShowButton)
    }
  }, [])

  // هندلر برای باز شدن سایدبار از طریق event
  useEffect(() => {
    const handleOpenSidebar = () => setIsMobileMenuOpen(true)
    window.addEventListener('openProfileSidebar', handleOpenSidebar)
    
    return () => {
      window.removeEventListener('openProfileSidebar', handleOpenSidebar)
    }
  }, [])

  // بستن منو موبایل وقتی مسیر تغییر می‌کنه
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // هندل کردن کلید Escape (برای منوی موبایل و مدال خروج)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLogoutModalOpen) {
          setIsLogoutModalOpen(false)
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false)
        }
      }
    }
    
    if (isMobileMenuOpen || isLogoutModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen, isLogoutModalOpen])

  // تابع باز کردن مدال خروج
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  // تابع تایید نهایی خروج
  const confirmLogout = async () => {
    await dispatch(logoutThunk())
    setIsLogoutModalOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/')
  }

  const handleMenuItemClick = (path: string) => {
    router.push(path)
  }

  const renderMenu = () => (
    <>
      {/* بخش بالایی: اسم کاربر */}
      <div className={styles.userCard}>
        <div className={styles.avatarCircle}>
          <IconUser size={32} stroke={1.5} />
        </div>
        <div className={styles.userName}>
          {fullName || 'کاربر عزیز'}
        </div>
        <div className={styles.userPhone}>
          {phoneNumber || '۰۹۱۲۳۴۵۶۷۸۹'}
        </div>
      </div>

      {/* منو */}
      <nav className={styles.menu}>
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={index}
              className={classNames(styles.menuItem, {
                [styles.active]: isActive,
              })}
              onClick={() => handleMenuItemClick(item.path)}
            >
              <div className={styles.menuItemRight}>
                <Icon size={22} stroke={1.5} />
                <span>{item.title}</span>
              </div>
              <IconChevronLeft size={18} stroke={1.5} />
            </button>
          )
        })}
      </nav>

      {/* کیف پول */}
      <button 
        className={classNames(styles.menuItem, {
          [styles.active]: pathname === '/profile/wallet'
        })}
        onClick={() => handleMenuItemClick('/profile/wallet')}
      >
        <div className={styles.menuItemRight}>
          <IconWallet size={22} stroke={1.5} />
          <span>کیف پول</span>
        </div>
        <IconChevronLeft size={18} stroke={1.5} />
      </button>

      {/* دکمه خروج (فقط مدال را باز می‌کند) */}
      <button className={styles.logoutButton} onClick={handleLogoutClick}>
        <IconLogout size={22} stroke={1.5} />
        <span>خروج از حساب</span>
      </button>
    </>
  )

  return (
    <>
      {/* سایدبار دسکتاپ */}
      <aside className={styles.sidebar}>
        {renderMenu()}
      </aside>

      {/* Overlay منوی موبایل */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* منوی تمام‌صفحه موبایل */}
      <div className={classNames(styles.mobileMenu, {
        [styles.mobileMenuOpen]: isMobileMenuOpen
      })}>
        {/* هدر منوی موبایل */}
        <div className={styles.mobileMenuHeader}>
          <button 
            className={styles.closeButton}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="بستن منو"
          >
            <IconArrowRight size={20} stroke={1.5} />
            <span>بازگشت</span>
          </button>
          <h2 className={styles.mobileMenuTitle}>منو کاربری</h2>
          <div className={styles.headerSpacer} />
        </div>

        {/* محتوای منو */}
        <div className={styles.mobileMenuContent}>
          {renderMenu()}
        </div>
      </div>

      {/* مدال تایید خروج */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <IconLogout size={48} stroke={1.5} />
            </div>
            <h3 className={styles.modalTitle}>خروج از حساب کاربری</h3>
            <p className={styles.modalText}>آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.confirmBtn} 
                onClick={confirmLogout}
              >
                بله، خارج می‌شوم
              </button>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setIsLogoutModalOpen(false)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileSidebar