'use client'

import React from 'react'
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
} from '@tabler/icons-react'
import { logoutThunk } from '@/store/feature/auth/authThunks'
import { selectUserFullName } from '@/store/feature/profile/profileSelectors'
import { selectProfile } from '@/store/feature/profile/profileSelectors'
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
  
  // گرفتن اطلاعات از ریداکس
  const fullName = useAppSelector(selectUserFullName)
  const profile = useAppSelector(selectProfile)
  const phoneNumber = profile?.phoneNumber || ''

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    router.push('/')
  }

  return (
    <aside className={styles.sidebar}>
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
              onClick={() => router.push(item.path)}
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

      {/* خروج */}
      <button className={styles.logoutButton} onClick={handleLogout}>
        <IconLogout size={22} stroke={1.5} />
        <span>خروج از حساب</span>
      </button>
    </aside>
  )
}

export default ProfileSidebar