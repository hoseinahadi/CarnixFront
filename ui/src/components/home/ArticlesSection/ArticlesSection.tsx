'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from './ArticlesSection.module.scss';
import ArticleCard from '@/features/content/components/ArticleCard/ArticleCard';

// ایمپورت هوک‌های ریداکس (مسیر این فایل بستگی به ساختار پوشه‌های شما دارد، معمولاً در پوشه store/hooks است)
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// ایمپورت Thunk و Selector هایی که در مراحل قبل ایجاد کردیم
import { getLatestContents } from '@/store/feature/content/ContentManagerThunks';
import {
  selectLatestContents,
  selectContentManagerLoading
} from '@/store/feature/content/ContentManagerSelectors';

const ArticlesSection = () => {
  const dispatch = useAppDispatch();

  // دریافت لیست مقالات و وضعیت لودینگ از Redux Store
  const articles = useAppSelector(selectLatestContents);
  const loading = useAppSelector(selectContentManagerLoading);
  console.log("articles", articles)
  const [pageSize, setPageSize] = useState<number>(3);

  useEffect(() => {
    const determinePageSize = () => {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 992) return 2;
      return 3; // در تصویر دسکتاپ 3 مقاله کنار هم هستند
    };

    const size = determinePageSize();
    setPageSize(size);

    // فراخوانی API از طریق Redux Thunk
    dispatch(getLatestContents(size));
  }, [dispatch]);

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.grid}>
          {Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    );
  }

  // اگر مقاله‌ای وجود نداشت کامپوننت رندر نشود (تا UI خالی نماند)
  if (!articles || articles.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>مقالات</h2>
        <Link href="/blog" className={styles.link}>
          <div style={{width:'100%'}}>

            مشاهده همه
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{maxWidth:'24'}}>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {/* استفاده از دیتای واقعی دریافت شده از بک‌اند */}
        {articles.slice(0, pageSize).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default ArticlesSection;
