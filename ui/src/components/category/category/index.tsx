'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store'; // مسیر استور خود را چک کنید
import { fetchCategories } from '@/store/feature/Category/categoryThunks';
import { CategorySlider } from './CategorySlider'; // ایمپورت کامپوننت UI که قبلا ساختیم
import styles from './styles.module.scss'
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const CategorySliderWidget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>در حال بارگذاری...</div>;
  }

  // اگر خطایی بود یا دیتایی نبود، کل این Section (حتی عنوانش) مخفی می‌شود
  if (error || categories.length === 0) return null;

  return (
    // سکشن به داخل این ویجت منتقل شد
    <section className="container-max-width my-xxxl">
      
      {/* هدر شامل عنوان و دکمه‌ها */}
      <div className={styles.header}>
        <h2 className={styles.titleCat}>دسته بندی ها</h2>
        
        <div className={styles.navWrapper}>
          {/* کلاس‌های category-prev و category-next برای اتصال به Swiper حیاتی هستند */}
          <button className={`category-prev ${styles.customNavBtn}`}>
            <ChevronRight size={20} />
          </button>
          <button className={`category-next ${styles.customNavBtn}`}>
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* پاس دادن دیتا به اسلایدر */}
      <CategorySlider categories={categories} />
      
    </section>
  );
};

export default CategorySliderWidget;
