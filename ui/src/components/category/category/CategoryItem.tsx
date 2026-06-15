import React from 'react';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Category } from '@/models/category/Category';
import styles from './styles.module.scss';

interface CategoryItemProps {
  category: Category;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  // بررسی می‌کنیم که آیا logoUrl وجود دارد و خالی نیست
  const hasLogo = category.logoUrl && category.logoUrl.trim() !== '';

  return (
    <Link href={`/categories/${category.slug}`} className={styles.categoryItem}>
      
      <div className={styles.iconBox}>
        {hasLogo ? (
          // اگر لوگو داشت، عکس را نمایش بده
          <img 
            src={category.logoUrl} 
            alt={category.name} 
            className={styles.logoImage}
          />
        ) : (
          // اگر لوگو نداشت، آیکون پیش‌فرض را با سایز متغیر نشان بده
          <Wrench 
            className={styles.defaultIcon} 
            strokeWidth={1.5} 
          />
        )}
      </div>

      <span className={styles.itemTitle} title={category.name}>
        {category.name}
      </span>
      
    </Link>
  );
};