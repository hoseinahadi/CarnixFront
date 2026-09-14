import React from 'react';
import styles from './BlogCategoryFilter.module.scss';

export interface CategoryType {
  id: string | number;
  name: string;
}

interface Props {
  categories: CategoryType[];
  activeCategoryId: string | number;
  onSelect: (id: string | number) => void;
}

const BlogCategoryFilter: React.FC<Props> = ({ categories, activeCategoryId, onSelect }) => {
  return (
    <div className={styles.filterContainer} aria-label="دسته‌بندی مقالات">
      <ul className={styles.categoryList} role="tablist">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategoryId === cat.id}
              className={`${styles.categoryBtn} ${activeCategoryId === cat.id ? styles.active : ''}`}
              onClick={() => onSelect(cat.id)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogCategoryFilter;
