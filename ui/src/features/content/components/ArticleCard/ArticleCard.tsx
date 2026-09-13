import React from 'react';
import Link from 'next/link';
import styles from './ArticleCard.module.scss';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';

// این تایپ باید بر اساس خروجی لیست مقالات از بک‌اند تنظیم شود
export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string; // خلاصه متن
  imageUrl: string;
}

interface ArticleCardProps {
  article: ArticleSummary;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link href={`/blog/${article.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {article.imageUrl ? (
          <OptimizedImage
            src={article.imageUrl}
            alt={article.title}
            className={styles.image}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          />
        ) : (
          <div className={styles.placeholder}>بدون تصویر</div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.excerpt}>{article.excerpt}</p>
      </div>
    </Link>
  );
};

export default ArticleCard;
