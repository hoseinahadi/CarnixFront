'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import styles from './WishlistPage.module.scss'
import { IconHeart } from '@tabler/icons-react'

export default function WishlistPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>لیست علاقه‌مندی‌ها</h2>

      <div className={styles.emptyState}>
        <IconHeart size={64} stroke={1} className={styles.emptyIcon} />
        <h3>لیست علاقه‌مندی‌ها خالی است</h3>
        <p>محصولات مورد علاقه خود را به این لیست اضافه کنید.</p>
        <button onClick={() => router.push('/')} className={styles.shopButton}>
          رفتن به فروشگاه
        </button>
      </div>
    </div>
  )
}