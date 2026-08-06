'use client'

import Logo from '@/components/common/Logo/Logo'
import React, { useState } from 'react'
import styles from './TopHeader.module.scss'
import SearchAutocomplete from '@/features/search/components/SearchAutocomplete/SearchAutocomplete'
import HeaderAction from '../HeaderAction/HeaderAction'
import { IconSearch, IconX, IconMenu2 } from '@tabler/icons-react'

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
        >
          <IconMenu2 size={24} />
        </button>

        <div className={styles.logoContainer}>
          <Logo/>
        </div>
        
        <div className={styles.searchContainer}>
          <SearchAutocomplete/>
        </div>
        
        
        
        <div className={styles.actionContainer}>
          <button 
          className={styles.mobileSearchBtn}
          onClick={() => setIsSearchModalOpen(true)}
        >
          <IconSearch size={20} />
        </button>
          <HeaderAction/>
        </div>
      </div>

      {isSearchModalOpen && (
        <div className={styles.searchModal}>
          <div className={styles.searchModalHeader}>
            <h3>جستجو</h3>
            <button onClick={() => setIsSearchModalOpen(false)}>
              <IconX size={24} />
            </button>
          </div>
          <div className={styles.searchModalContent}>
            <SearchAutocomplete />
          </div>
        </div>
      )}
    </>
  )
}

export default TopHeader