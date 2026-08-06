// components/common/SupportFab/SupportFab.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  IconHeadphones, 
  IconBrandWhatsapp, 
  IconMessageCircle,
  IconX 
} from '@tabler/icons-react'
import styles from './SupportFab.module.scss'

const SupportFab = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // مخفی کردن FAB هنگام باز بودن مدال‌ها
  useEffect(() => {
    const handleModalOpened = () => setIsVisible(false)
    const handleModalClosed = () => setIsVisible(true)

    window.addEventListener('modalOpened', handleModalOpened)
    window.addEventListener('modalClosed', handleModalClosed)

    return () => {
      window.removeEventListener('modalOpened', handleModalOpened)
      window.removeEventListener('modalClosed', handleModalClosed)
    }
  }, [])

  // مخفی/نمایش FAB هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // مخفی کردن هنگام اسکرول به پایین - فقط اگر منو باز نباشه
      if (!isOpen) {
        if (currentScrollY > lastScrollY && currentScrollY > 300) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isOpen])

  // بستن منو با Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest(`.${styles.fabContainer}`)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  const handleWhatsApp = () => {
    window.open('https://wa.me/9188693049', '_blank')
    setIsOpen(false)
  }

  const handleLiveChat = () => {
    // TODO: اینجا می‌تونی چت آنلاین رو باز کنی
    alert('چت آنلاین به زودی راه‌اندازی می‌شود')
    setIsOpen(false)
  }

  return (
    <div className={`${styles.fabContainer} ${!isVisible && !isOpen ? styles.hidden : ''}`}>
      {/* Overlay برای موبایل */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* دکمه‌های منو */}
      <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}>
        {/* واتساپ */}
        <button 
          className={`${styles.menuItem} ${styles.whatsappButton}`}
          onClick={handleWhatsApp}
          aria-label="پشتیبانی واتساپ"
        >
          <div className={styles.menuItemContent}>
            <IconBrandWhatsapp size={20} stroke={1.5} />
            <span>واتساپ</span>
          </div>
          <span className={styles.menuItemSub}>پاسخگویی سریع</span>
        </button>

        {/* چت آنلاین */}
        <button 
          className={`${styles.menuItem} ${styles.chatButton}`}
          onClick={handleLiveChat}
          aria-label="چت آنلاین"
        >
          <div className={styles.menuItemContent}>
            <IconMessageCircle size={20} stroke={1.5} />
            <span>چت آنلاین</span>
          </div>
          <span className={styles.menuItemSub}>پشتیبانی لحظه‌ای</span>
        </button>
      </div>

      {/* دکمه اصلی */}
      <button 
        className={`${styles.fabButton} ${isOpen ? styles.fabActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="پشتیبانی"
      >
        {isOpen ? (
          <IconX size={24} stroke={2} />
        ) : (
          <IconHeadphones size={24} stroke={2} />
        )}
      </button>
    </div>
  )
}

export default SupportFab