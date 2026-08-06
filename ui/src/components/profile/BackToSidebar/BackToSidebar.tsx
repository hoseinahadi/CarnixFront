// components/profile/BackToSidebar/BackToSidebar.tsx
'use client'

import React from 'react'
import { IconArrowRight } from '@tabler/icons-react'
import styles from './BackToSidebar.module.scss'

const BackToSidebar = () => {
  const handleClick = () => {
    // دیسپچ event برای باز کردن سایدبار
    window.dispatchEvent(new CustomEvent('openProfileSidebar'))
  }

  return (
    <button className={styles.backButton} onClick={handleClick}>
      <IconArrowRight size={54} stroke={1.5} />
      
    </button>
  )
}

export default BackToSidebar