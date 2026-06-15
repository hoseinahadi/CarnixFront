import React from 'react'
import ProfileSidebar from '@/components/profile/ProfileSidebar/ProfileSidebar'
import styles from './ProfileLayout.module.scss'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <ProfileSidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}