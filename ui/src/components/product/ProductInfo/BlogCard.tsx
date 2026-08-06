import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ContentSummaryDto } from '@/features/content/api/ContentManagerApi';
import { ArrowLeft } from 'lucide-react';
import styles from './BlogCard.module.scss';

interface BlogCardProps {
  article: ContentSummaryDto;
}

const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  return (
    <article className={styles.card}>
      <Link href={`/blog/${article.slug}`} className={styles.imageWrapper}>
        <Image 
          src={article.imageUrl || '/images/placeholder.jpg'} // در صورت نبود عکس، از پلیس‌هولدر استفاده می‌شود
          alt={article.title} 
          fill 
          draggable={false} // جلوگیری از درگ شدن عکس و قفل شدن اسکرول صفحه
          className={styles.image} 
        />
      </Link>
      <div className={styles.content}>
        <Link href={`/blog/${article.slug}`}>
          <h3 className={styles.title}>{article.title}</h3>
        </Link>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <Link href={`/blog/${article.slug}`} className={styles.readMore}>
          <span>ادامه مطلب</span>
          <ArrowLeft size={16} />
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;