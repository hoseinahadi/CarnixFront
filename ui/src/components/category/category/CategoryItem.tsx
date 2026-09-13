'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  Settings, 
  Zap, 
  CarFront, 
  Activity, 
  Disc, 
  GitMerge, 
  Droplet 
} from 'lucide-react';
import { Category } from '@/models/category/Category';
import styles from './styles.module.scss';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';

interface CategoryItemProps {
  category: Category;
}

// 🟢 تبدیل ID دسته‌بندی‌ها به آیکون‌های متناسب با لیست شما
const getCategoryIcon = (categoryId: number, className: string) => {
  switch (categoryId) {
    case 37: return <Settings className={className} strokeWidth={1.5} />; // قطعات موتوری
    case 38: return <Zap className={className} strokeWidth={1.5} />; // قطعات برقی
    case 39: return <CarFront className={className} strokeWidth={1.5} />; // قطعات بدنه
    case 40: return <Activity className={className} strokeWidth={1.5} />; // تعلیق و فرمان
    case 41: return <Disc className={className} strokeWidth={1.5} />; // سیستم ترمز
    case 42: return <GitMerge className={className} strokeWidth={1.5} />; // سیستم انتقال قدرت
    case 43: return <Droplet className={className} strokeWidth={1.5} />; // مصرفی و سرویس
    default: return <Wrench className={className} strokeWidth={1.5} />; // سایر موارد
  }
};

export const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const router = useRouter();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const hasLogo = category.logoUrl && category.logoUrl.trim() !== '';
  // استفاده از slug برای لینک‌دهی تمیز (SEO Friendly)
  const href = `/products/${category.slug || category.categoryId}`;

  return (
    <Link
      href={href}
      className={styles.categoryItem}
      title={category.name}
      aria-label={`مشاهده محصولات دسته ${category.name}`}
      draggable={false}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const start = pointerStart.current;
        pointerStart.current = null;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
        router.push(href);
      }}
    >
      
      <div className={styles.iconBox}>
        {hasLogo ? (
          <OptimizedImage 
            src={category.logoUrl} 
            alt={`قطعات ${category.name}`} 
            className={styles.logoImage}
            width={48}
            height={48}
            sizes="48px"
          />
        ) : (
          getCategoryIcon(category.categoryId, styles.defaultIcon)
        )}
      </div>

      <span className={styles.itemTitle}>
        {category.name}
      </span>
      
    </Link>
  );
};
