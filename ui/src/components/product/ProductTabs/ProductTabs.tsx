'use client'

import React from 'react'
import styles from './ProductTabs.module.scss'
import classNames from 'classnames'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface ProductTabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab: string
  onTabChange: (tabId: string) => void
}

const ProductTabs = ({ tabs, defaultTab, activeTab, onTabChange }: ProductTabsProps) => {
  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={classNames(styles.tabButton, {
              [styles.active]: activeTab === tab.id,
            })}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default ProductTabs