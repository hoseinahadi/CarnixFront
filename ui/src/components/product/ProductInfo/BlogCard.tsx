import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';
import { ContentSummaryDto } from '@/features/content/api/ContentManagerApi';
import { ArrowLeft } from 'lucide-react';
import styles from './BlogCard.module.scss';

interface BlogCardProps {
  article: ContentSummaryDto;
}

const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  return (
    <article className={styles.card}>
      <Link href={`/blog/${article.slug || article.dynamicContentId}`} className={styles.imageWrapper}>
        <OptimizedImage 
          src={article.imageUrl || '/images/placeholder.jpg'} // در صورت نبود عکس، از پلیس‌هولدر استفاده می‌شود
          alt={article.title} 
          fill 
          draggable={false} // جلوگیری از درگ شدن عکس و قفل شدن اسکرول صفحه
          className={styles.image} 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
        />
      </Link>
      <div className={styles.content}>
        <Link href={`/blog/${article.slug || article.dynamicContentId}`}>
          <h3 className={styles.title}>{article.title}</h3>
        </Link>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <Link href={`/blog/${article.slug || article.dynamicContentId}`} className={styles.readMore}>
          <span>ادامه مطلب</span>
          <ArrowLeft size={16} />
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
