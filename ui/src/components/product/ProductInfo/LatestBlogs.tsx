'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
// لطفاً آدرس دقیق هوک‌های خود را در خط زیر در صورت نیاز اصلاح کنید
import { useAppDispatch, useAppSelector } from '@/store/hooks'; 
import { getLatestContents } from '@/store/feature/content/ContentManagerThunks';
import { selectLatestContents, selectContentManagerLoading } from '@/store/feature/content/ContentManagerSelectors';
import BlogCard from '@/components/product/ProductInfo/BlogCard'; // مسیر صحیح
import styles from './LatestBlogs.module.scss';

const LatestBlogs: React.FC = () => {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectLatestContents);
  const loading = useAppSelector(selectContentManagerLoading);

  useEffect(() => {
    // دریافت 3 مقاله جدید به محض لود شدن کامپوننت
    dispatch(getLatestContents(3));
  }, [dispatch]);

  // اگر دیتایی وجود نداشت رندر نشود
  if (!loading && (!articles || articles.length === 0)) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>جدیدترین مقالات مجله کارنیکس</h2>
          <Link href="/blog" className={styles.viewAll}>
            مشاهده همه مقالات
          </Link>
        </div>
        
        {/* در صورت نیاز می‌توانید به جای متن لودینگ یک Skeleton اضافه کنید */}
        {loading ? (
          <div className={styles.loading}>در حال بارگذاری مقالات...</div>
        ) : (
          <div className={styles.grid}>
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestBlogs;