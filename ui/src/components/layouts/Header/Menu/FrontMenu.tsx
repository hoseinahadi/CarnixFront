'use client'

import { useEffect, useState } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  useDismiss,
  useRole,
  useInteractions,
  useHover,
  safePolygon,
  FloatingPortal,
} from '@floating-ui/react'

import { LayoutGrid, Car, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DropdownMenu from './DropdownMenu'

import styles from './FrontMenu.module.scss'

// === Redux Imports ===
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { RootState } from '@/store'
import { fetchCategories } from '@/store/feature/Category/categoryThunks'
import { getAllBrands } from '@/store/feature/brand/BrandThunks'
import { getAllMakes } from '@/store/feature/vehicle/VehicleThunks'

const FrontMenu = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // خواندن داده‌ها از استیت ریداکس
  const categories = useAppSelector((state: RootState) => state.category.categories)
  const brands = useAppSelector((state: RootState) => state.brand.brands)
  const makes = useAppSelector((state: RootState) => state.vehicle.makes)

  const [openCategory, setOpenCategory] = useState(false)

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories())
    }
    if (brands.length === 0) {
      dispatch(getAllBrands())
    }
    if (makes.length === 0) {
      dispatch(getAllMakes())
    }
  }, [dispatch, categories.length, brands.length, makes.length])

  /* ================= Floating فقط برای دسته‌بندی ================= */

  const category = useFloating({
    open: openCategory,
    onOpenChange: setOpenCategory,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [offset(12)],
  })

  const categoryInteractions = useInteractions([
    useHover(category.context, {
      handleClose: safePolygon(),
      delay: { open: 80, close: 120 },
    }),
    useDismiss(category.context),
    useRole(category.context, { role: 'menu' }),
  ])

  return (
    <>
      {/* ================= Header Menu ================= */}
      <div className={styles.container}>
        {/* دسته‌بندی کالاها - دراپ‌داون */}
        <div
          ref={category.refs.setReference}
          className={styles.trigger}
          style={{ paddingLeft: '5rem' }}
          {...categoryInteractions.getReferenceProps()}
        >
          <LayoutGrid size={20} />
          <span className={styles.triggerText}>دسته‌بندی کالاها</span>
        </div>

        {/* ماشین‌ها - لینک به صفحه */}
        <div
          className={styles.trigger}
          style={{ paddingLeft: '4rem', cursor: 'pointer' }}
          onClick={() => router.push('/vehicles')}
        >
          <Car size={18} />
          <span className={styles.triggerText}>ماشین‌ها</span>
        </div>

        {/* برندها - لینک به صفحه */}
        <div
          className={styles.trigger}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/brands')}
        >
          <Tag size={18} />
          <span className={styles.triggerText}>برندها</span>
        </div>
      </div>

      {/* ================= Overlay فقط برای دسته‌بندی ================= */}
      {openCategory && (
        <div
          className={styles.overlay}
          onMouseEnter={() => setOpenCategory(false)}
        />
      )}

      {/* ================= Mega Menu فقط برای دسته‌بندی ================= */}
      {openCategory && (
        <FloatingPortal>
          <div
            ref={category.refs.setFloating}
            className={styles.megaMenu}
            {...categoryInteractions.getFloatingProps()}
          >
            <DropdownMenu categories={categories} />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export default FrontMenu