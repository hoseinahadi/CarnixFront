'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getLatestContents } from '@/store/feature/content/ContentManagerThunks';
import { selectLatestContents, selectContentManagerLoading } from '@/store/feature/content/ContentManagerSelectors';

// ایمپورت کامپوننت‌ها از مسیر قبلی
import BlogCard from '@/components/product/ProductInfo/BlogCard'; 
import BlogCategoryFilter from '@/components/product/ProductInfo/BlogCategoryFilter';

import { BookOpen } from 'lucide-react';
import styles from './BlogArchive.module.scss';

// دسته‌بندی‌های نمونه (بعداً می‌توانید از Redux / API دریافت کنید)
const MOCK_CATEGORIES = [
  { id: 'all', name: 'همه مقالات' },
  { id: 'news', name: 'اخبار خودرو' },
  { id: 'tutorial', name: 'آموزش تعمیرات' },
  { id: 'buying-guide', name: 'راهنمای خرید قطعات' },
  { id: 'reviews', name: 'نقد و بررسی' },
];

export default function BlogArchivePage() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectLatestContents);
  const loading = useAppSelector(selectContentManagerLoading);
  const [activeCategory, setActiveCategory] = useState<string | number>('all');

  useEffect(() => {
    // درخواست ۱۲ مقاله جدید برای صفحه اصلی بلاگ
    dispatch(getLatestContents(12));
  }, [dispatch]);

  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <BookOpen size={32} className={styles.icon} />
          <h1 className={styles.title}>مجله کارنیکس</h1>
        </div>
        <p className={styles.subtitle}>
          آخرین مقالات، آموزش‌ها و اخبار دنیای خودرو و قطعات یدکی
        </p>
      </header>

      <BlogCategoryFilter 
        categories={MOCK_CATEGORIES} 
        activeCategoryId={activeCategory} 
        onSelect={(id) => setActiveCategory(id)} 
      />

      {loading ? (
        <div className={styles.grid}>
          {/* نمایش Skeleton Loading تا زمان دریافت دیتا */}
          {[...Array(8)].map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText} style={{ height: '24px', width: '80%' }}></div>
              <div className={styles.skeletonText} style={{ height: '16px', width: '100%', marginTop: '16px' }}></div>
              <div className={styles.skeletonText} style={{ height: '16px', width: '60%' }}></div>
            </div>
          ))}
        </div>
      ) : articles && articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>در حال حاضر مقاله‌ای برای نمایش وجود ندارد.</p>
        </div>
      )}
    </main>
  );
}
