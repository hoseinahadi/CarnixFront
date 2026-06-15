// components/product/ProductSort/ProductSort.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilters, fetchFilteredProducts } from '@/store/feature/product/productFilterSlice'
import { selectActiveFilters } from '@/store/feature/product/productFilterSelectors'
import styles from './ProductSort.module.scss'
import { IconArrowsSort, IconCheck, IconX } from '@tabler/icons-react'
import classNames from 'classnames'

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'cheapest', label: 'ارزان‌ترین' },
  { value: 'expensive', label: 'گران‌ترین' },
  { value: 'discounted', label: 'بیشترین تخفیف' },
]

const ProductSort = () => {
  const dispatch = useAppDispatch()
  const activeFilters = useAppSelector(selectActiveFilters)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  const currentSort = SORT_OPTIONS.find(opt => opt.value === activeFilters.sortBy) || SORT_OPTIONS[0]

  // تشخیص موبایل بودن
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSort = (value: string) => {
    dispatch(setFilters({ sortBy: value as any }))
    const newFilters = { ...activeFilters, sortBy: value as any, page: 1 }
    dispatch(fetchFilteredProducts(newFilters))
    setIsOpen(false)
  }

  // کلیک خارج از دراپ‌داون (فقط دسکتاپ)
  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  // بستن با کلید Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // جلوگیری از اسکرول بادی هنگام باز بودن مودال
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, isMobile])

  return (
    <div className={styles.sortContainer} ref={dropdownRef}>
      {/* دکمه باز کردن */}
      <button
        className={styles.sortButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="مرتب‌سازی"
      >
        <IconArrowsSort size={18} />
        <span className={styles.sortLabel}>{currentSort.label}</span>
      </button>

      {/* دراپ‌داون دسکتاپ */}
      {isOpen && !isMobile && (
        <div className={styles.dropdown}>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              className={classNames(styles.dropdownItem, {
                [styles.active]: activeFilters.sortBy === option.value,
              })}
              onClick={() => handleSort(option.value)}
            >
              <span>{option.label}</span>
              {activeFilters.sortBy === option.value && (
                <IconCheck size={16} className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* مودال موبایل */}
      {isOpen && isMobile && (
        <>
          {/* Overlay */}
          <div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className={styles.bottomSheet}>
            {/* هدر مودال */}
            <div className={styles.bottomSheetHeader}>
              <h3 className={styles.bottomSheetTitle}>مرتب‌سازی</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="بستن"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* گزینه‌ها */}
            <div className={styles.bottomSheetContent}>
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={classNames(styles.radioItem, {
                    [styles.radioActive]: activeFilters.sortBy === option.value,
                  })}
                  onClick={() => handleSort(option.value)}
                >
                  <div className={styles.radioCircle}>
                    {activeFilters.sortBy === option.value && (
                      <div className={styles.radioDot} />
                    )}
                  </div>
                  <span className={styles.radioLabel}>{option.label}</span>
                  {activeFilters.sortBy === option.value && (
                    <IconCheck size={16} className={styles.checkIcon} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProductSort