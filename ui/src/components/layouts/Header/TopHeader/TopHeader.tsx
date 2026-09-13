'use client'

import Logo from '@/components/common/Logo/Logo'
import React, { useState } from 'react'
import styles from './TopHeader.module.scss'
import SearchAutocomplete from '@/features/search/components/SearchAutocomplete/SearchAutocomplete'
import HeaderAction from '../HeaderAction/HeaderAction'
import { IconSearch, IconX, IconMenu2 } from '@tabler/icons-react'
import Dialog from '@/components/common/Dialog/Dialog'

interface TopHeaderProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

const TopHeader = ({ onMenuClick, isMenuOpen }: TopHeaderProps) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <>
      <div className={styles.container}>
        {/* دکمه همبرگر (فقط در موبایل) */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={onMenuClick}
          type="button"
          aria-label={isMenuOpen ? 'بستن منوی اصلی' : 'باز کردن منوی اصلی'}
          aria-expanded={isMenuOpen}
        >
          <IconMenu2 size={20} />
        </button>

        <div className={styles.logoContainer}>
          <Logo className={styles.headerLogo}/>
        </div>
        
        <div className={styles.searchContainer}>
          <SearchAutocomplete/>
        </div>
        
        
        
        <div className={styles.actionContainer}>
          <button 
          className={styles.mobileSearchBtn}
          onClick={() => setIsSearchModalOpen(true)}
          type="button"
          aria-label="باز کردن جستجو"
        >
          <IconSearch size={18} />
        </button>
          <HeaderAction/>
        </div>
      </div>

      <Dialog open={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} title="جستجو" overlayClassName={styles.searchModal} contentClassName={styles.searchDialog}>
          <div className={styles.searchModalHeader}>
            <h3>جستجو</h3>
            <button type="button" aria-label="بستن جستجو" onClick={() => setIsSearchModalOpen(false)}>
              <IconX size={24} />
            </button>
          </div>
          <div className={styles.searchModalContent}>
            <SearchAutocomplete />
          </div>
      </Dialog>
    </>
  )
}

export default TopHeader
