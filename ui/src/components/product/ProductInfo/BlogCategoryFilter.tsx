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
    <div className={styles.filterContainer}>
      <ul className={styles.categoryList}>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
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