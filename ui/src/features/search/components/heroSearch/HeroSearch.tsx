'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './HeroSearch.module.scss';
import { useHeroSearch } from './useHeroSearch';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={styles.customSelectWrapper} ref={wrapperRef}>
      <div 
        className={`${styles.customSelectHeader} ${disabled ? styles.disabled : ''} ${isOpen ? styles.active : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? styles.selectedText : styles.placeholderText}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
      </div>

      {isOpen && (
        <div className={styles.customSelectList}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو..."
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <ul className={styles.optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt.value}
                  className={`${styles.optionItem} ${String(opt.value) === String(value) ? styles.selected : ''}`}
                  onClick={() => { 
                    onChange(opt.value); 
                    setIsOpen(false); 
                    setSearchTerm(''); 
                  }}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className={styles.noResult}>موردی یافت نشد</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function HeroSearch() {
  const {
    categories,
    makes,
    models,
    selectedCategory,
    setSelectedCategory,
    selectedMake,
    setSelectedMake,
    selectedModel,
    setSelectedModel,
    handleSearch
  } = useHeroSearch();

  const mainCategories = categories
    .filter(cat => !cat.parentCategoryId || cat.parentCategoryId === 0)
    .map(cat => ({ value: cat.slug || cat.categoryId, label: cat.name }));

  const makeOptions = makes.map(make => ({
    value: make.vehicleMakeId,
    label: make.name
  }));

  const modelOptions = models.map((model: any, index) => ({
    value: model.vehicleModelId || model.modelId || model.id || index,
    label: model.name
  }));

  return (
    <div className={styles.heroSearchWrapper}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        
        <h3 className={styles.mobileFormTitle}>قطعه مناسب خودروی خودت رو پیدا کن</h3>
        
        <div className={styles.formGroup}>
          <SearchableSelect 
            options={mainCategories}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(String(val))}
            placeholder="دسته بندی *"
          />
        </div>

        <div className={styles.divider}></div>

        <div className={styles.formGroup}>
          <SearchableSelect 
            options={makeOptions}
            value={selectedMake}
            onChange={(val) => setSelectedMake(String(val))}
            placeholder="ماشین *"
          />
        </div>

        <div className={styles.divider}></div>

        <div className={styles.formGroup}>
          <SearchableSelect 
            options={modelOptions}
            value={selectedModel}
            onChange={(val) => setSelectedModel(String(val))}
            placeholder="مدل تولید *"
            disabled={!selectedMake || models.length === 0}
          />
        </div>

        <button type="submit" className={styles.searchBtn}>
          <span>جست و جو</span>
        </button>

      </form>
    </div>
  );
}