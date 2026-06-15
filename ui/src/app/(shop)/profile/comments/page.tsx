'use client'

import React from 'react'
import styles from './CommentsPage.module.scss'
import { IconMessageCircle } from '@tabler/icons-react'

export default function CommentsPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>دیدگاه‌های من</h2>

      <div className={styles.emptyState}>
        <IconMessageCircle size={64} stroke={1} className={styles.emptyIcon} />
        <h3>دیدگاهی ثبت نشده</h3>
        <p>شما هنوز هیچ دیدگاهی ثبت نکرده‌اید.</p>
      </div>
    </div>
  )
}