// features/heroSearch/HeroSearch.tsx
'use client';

import React from 'react';
import styles from './HeroSearch.module.scss';
import { useHeroSearch } from './useHeroSearch';
import { Search } from 'lucide-react';

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

  return (
    <div className={styles.heroSearchWrapper}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        
        {/* فیلد دسته بندی */}
        <div className={styles.formGroup}>
          <label htmlFor="categorySelect" className={styles.srOnly}>دسته‌بندی</label>
          <select 
            id="categorySelect"
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">دسته بندی</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.slug || cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.divider}></div>

        {/* فیلد برند خودرو (سازنده) */}
        <div className={styles.formGroup}>
          <label htmlFor="makeSelect" className={styles.srOnly}>برند خودرو</label>
          <select 
            id="makeSelect"
            value={selectedMake} 
            onChange={(e) => setSelectedMake(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">برند خودرو</option>
            {makes.map((make) => (
              <option key={make.vehicleMakeId} value={make.vehicleMakeId}>
                {make.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.divider}></div>

        {/* فیلد مدل خودرو */}
        <div className={styles.formGroup}>
          <label htmlFor="modelSelect" className={styles.srOnly}>مدل ماشین</label>
          <select 
            id="modelSelect"
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className={styles.selectInput}
            disabled={!selectedMake || models.length === 0}
          >
            <option value="">مدل ماشین</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* دکمه جستجو */}
        <button type="submit" className={styles.searchBtn}>
          جستجو
        </button>

      </form>
    </div>
  );
}
