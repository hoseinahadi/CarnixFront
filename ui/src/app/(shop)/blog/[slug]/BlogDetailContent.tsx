'use client';

import React, { useEffect, useState, use } from 'react';
import { ContentManagerApi, FullContentDisplayDto } from '@/features/content/api/ContentManagerApi';
import { Calendar, AlertCircle, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './BlogDetail.module.scss';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailContent({ params }: PageProps) {
  // باز کردن Promise پارامترها با هوک use (مخصوص Next.js 15+)
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [article, setArticle] = useState<FullContentDisplayDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت اطلاعات مقاله از API بر اساس Slug
  useEffect(() => {
    let active = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const decodedSlug = decodeURIComponent(slug);
        const response = await ContentManagerApi.getContentForDisplay(decodedSlug);
        if (!active) return;

        if (response.data.isSuccess && response.data.data) {
          setArticle(response.data.data);
        } else {
          setError(response.data.message || 'مقاله مورد نظر پیدا نشد.');
        }
      } catch (err: any) {
        if (active) {
          setError(err.response?.data?.message || 'ارتباط با سرور برقرار نشد.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (slug) void fetchArticle();

    return () => {
      active = false;
    };
  }, [slug]);

  // وضعیت لودینگ (Skeleton Loading)
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonMeta}></div>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText} style={{ width: '80%' }}></div>
      </div>
    );
  }

  // وضعیت خطا یا پیدا نشدن مقاله
  if (error || !article) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>{error || 'محتوایی یافت نشد'}</h2>
          <Link href="/blog" className={styles.backToBlogBtn}>
            بازگشت به مجله کارنیکس
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.container}>
      {/* دکمه بازگشت */}
      <div className={styles.breadcrumb}>
        <Link href="/blog" className={styles.backLink}>
          <ChevronRight size={20} />
          بازگشت به مجله کارنیکس
        </Link>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          {article.publishDate && (
            <span className={styles.metaItem}>
              <Calendar size={18} />
              {new Date(article.publishDate).toLocaleDateString('fa-IR')}
            </span>
          )}
          <span className={styles.metaItem}>
            <User size={18} />
            تیم تحریریه کارنیکس
          </span>
        </div>
      </header>

      {/* بدنه اصلی مقاله */}
      <div 
        className={styles.bodyContent}
        dangerouslySetInnerHTML={{ __html: article.body }} 
      />
    </article>
  );
}