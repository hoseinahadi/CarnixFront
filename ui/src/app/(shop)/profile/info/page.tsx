'use client'

import React from 'react'
import ProfileInfo from '@/components/profile/ProfileInfo/ProfileInfo'
import ChangePassword from '@/components/profile/ChangePassword/ChangePassword'
import styles from './InfoPage.module.scss'

export default function ProfileInfoPage() {
  return (
    <div className={styles.page}>
      <ProfileInfo />
      {/* <ChangePassword /> */}
    </div>
  )
}