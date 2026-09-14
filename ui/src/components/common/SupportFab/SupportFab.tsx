'use client'

import { useEffect, useState } from 'react'
import {
  IconBrandWhatsapp,
  IconHeadphones,
  IconMessageCircle,
  IconX,
} from '@tabler/icons-react'

import { useSiteSettings } from '@/features/settings/useSiteSettings'
import styles from './SupportFab.module.scss'

export default function SupportFab() {
  const settings = useSiteSettings()
  const [open, setOpen] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)
  const [scrollHidden, setScrollHidden] = useState(false)
  const [modalHidden, setModalHidden] = useState(false)

  const visible = !footerVisible && !scrollHidden && !modalHidden

  useEffect(() => {
    const hide = () => {
      setModalHidden(true)
      setOpen(false)
    }
    const show = () => setModalHidden(false)

    window.addEventListener('modalOpened', hide)
    window.addEventListener('modalClosed', show)

    return () => {
      window.removeEventListener('modalOpened', hide)
      window.removeEventListener('modalClosed', show)
    }
  }, [])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const footerIsVisible = entry.isIntersecting
        setFooterVisible(footerIsVisible)
        if (footerIsVisible) setOpen(false)
      },
      { threshold: 0.01 },
    )

    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (Math.abs(currentScrollY - lastScrollY) < 6) return

      setScrollHidden(currentScrollY > lastScrollY && currentScrollY > 48)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  if (!settings?.whatsappNumber) return null

  const launch = (message = '') => {
    const query = message ? `?text=${encodeURIComponent(message)}` : ''
    window.open(`https://wa.me/${settings.whatsappNumber}${query}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div className={`${styles.fabContainer} ${visible ? '' : styles.hidden}`}>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className={`${styles.menu} ${open ? styles.menuOpen : ''}`}>
        <button type="button" className={`${styles.menuItem} ${styles.whatsappButton}`} onClick={() => launch()} aria-label="پشتیبانی واتساپ">
          <div className={styles.menuItemContent}><IconBrandWhatsapp size={20} /><span>واتساپ</span></div>
          <span className={styles.menuItemSub}>پاسخ‌گویی سریع</span>
        </button>
        <button type="button" className={`${styles.menuItem} ${styles.chatButton}`} onClick={() => launch(settings.whatsappMessage)} aria-label="گفت‌وگوی پشتیبانی">
          <div className={styles.menuItemContent}><IconMessageCircle size={20} /><span>گفت‌وگو</span></div>
          <span className={styles.menuItemSub}>ارسال پیام به پشتیبانی</span>
        </button>
      </div>

      <button
        type="button"
        className={`${styles.fabButton} ${open ? styles.fabActive : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label="پشتیبانی"
        aria-expanded={open}
      >
        {open ? <IconX size={24} /> : <IconHeadphones size={24} />}
      </button>
    </div>
  )
}
