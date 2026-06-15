// components/product/ProductFilters/FilterSection/FilterSection.tsx
import React from 'react'
import styles from './FilterSection.module.scss'
import { IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react'

interface FilterSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

const FilterSection = ({ title, expanded, onToggle, children, searchValue, onSearchChange, showSearch }: FilterSectionProps) => {
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={onToggle}>
        <span>{title}</span>
        {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </button>
      
      {expanded && (
        <div className={styles.sectionContent}>
          {showSearch && (
            <div className={styles.searchBox}>
              <IconSearch size={14} />
              <input
                type="text"
                placeholder={`جستجوی ${title}...`}
                value={searchValue || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

export default FilterSection