'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Car, Tag, LayoutGrid, ChevronLeft } from 'lucide-react';
import styles from './MobileMenu.module.scss';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const router = useRouter();
  const categories = useAppSelector((state: RootState) => state.category.categories);
  const brands = useAppSelector((state: RootState) => state.brand.brands);
  const makes = useAppSelector((state: RootState) => state.vehicle.makes);

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        {/* هدر منو */}
        <div className={styles.header}>
          <h3>فهرست</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* لیست منو */}
        <div className={styles.content}>
          {/* دسته‌بندی کالاها */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <LayoutGrid size={20} />
              <span>دسته‌بندی کالاها</span>
            </div>
            <div className={styles.sectionContent}>
              {categories.map((cat) => (
                <div key={cat.categoryId} className={styles.categoryItem}>
                  <Link 
                    href={`/products/${cat.categoryId}`}
                    onClick={onClose}
                    className={styles.categoryLink}
                  >
                    {cat.name}
                  </Link>
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className={styles.subCategories}>
                      {cat.subCategories.slice(0, 4).map((sub) => (
                        <Link
                          key={sub.categoryId}
                          href={`/products/${sub.categoryId}`}
                          onClick={onClose}
                          className={styles.subCategoryLink}
                        >
                          {sub.name}
                        </Link>
                      ))}
                      {cat.subCategories.length > 4 && (
                        <Link
                          href={`/products/${cat.categoryId}`}
                          onClick={onClose}
                          className={styles.viewAll}
                        >
                          مشاهده همه <ChevronLeft size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* خط جداکننده */}
          <div className={styles.divider} />

          {/* ماشین‌ها */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Car size={20} />
              <span>ماشین‌ها</span>
            </div>
            <div className={styles.sectionContent}>
              {makes.slice(0, 10).map((make) => (
                <Link
                  key={make.id}
                  href={`/vehicles/${make.name}`}
                  onClick={onClose}
                  className={styles.simpleLink}
                >
                  {make.name}
                </Link>
              ))}
              {makes.length > 10 && (
                <Link
                  href="/vehicles"
                  onClick={onClose}
                  className={styles.viewAll}
                >
                  مشاهده همه ماشین‌ها <ChevronLeft size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* خط جداکننده */}
          <div className={styles.divider} />

          {/* برندها */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Tag size={20} />
              <span>برندها</span>
            </div>
            <div className={styles.sectionContent}>
              {brands.slice(0, 10).map((brand) => (
                <Link
                  key={brand.brandId}
                  href={`/brands/${brand.name}`}
                  onClick={onClose}
                  className={styles.simpleLink}
                >
                  {brand.name}
                </Link>
              ))}
              {brands.length > 10 && (
                <Link
                  href="/brands"
                  onClick={onClose}
                  className={styles.viewAll}
                >
                  مشاهده همه برندها <ChevronLeft size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;