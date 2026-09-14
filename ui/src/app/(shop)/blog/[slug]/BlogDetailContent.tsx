'use client';

import { FormEvent, use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarDays, Clock3, Copy, Folder, Share2 } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';
import { ContentManagerApi, type ContentSummaryDto, type FullContentDisplayDto } from '@/features/content/api/ContentManagerApi';
import styles from './BlogDetail.module.scss';

interface PageProps { params: Promise<{ slug: string }>; }

const archiveItems = (value: unknown): ContentSummaryDto[] => {
  if (!value || typeof value !== 'object') return [];
  const response = value as Record<string, unknown>;
  const payload = (response.data ?? response.mainResults ?? response) as Record<string, unknown>;
  if (Array.isArray(payload.items)) return payload.items as ContentSummaryDto[];
  if (Array.isArray(payload.data)) return payload.data as ContentSummaryDto[];
  if (Array.isArray(payload.mainResults)) return payload.mainResults as ContentSummaryDto[];
  return [];
};

export default function BlogDetailContent({ params }: PageProps) {
  const { slug } = use(params);
  const [article, setArticle] = useState<FullContentDisplayDto | null>(null);
  const [articles, setArticles] = useState<ContentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const decodedSlug = decodeURIComponent(slug);
        const [detailResponse, archiveResponse] = await Promise.all([
          ContentManagerApi.getContentForDisplay(decodedSlug),
          ContentManagerApi.getArticleArchive(),
        ]);
        if (!active) return;
        if (!detailResponse.data.isSuccess || !detailResponse.data.data) {
          setError(detailResponse.data.message || 'مقاله مورد نظر پیدا نشد.');
          return;
        }
        setArticle(detailResponse.data.data);
        setArticles(archiveItems(archiveResponse.data));
      } catch {
        if (active) setError('ارتباط با سرور برقرار نشد.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (slug) void load();
    return () => { active = false; };
  }, [slug]);

  const summary = useMemo(() => articles.find((item) => item.slug === decodeURIComponent(slug)), [articles, slug]);
  const related = useMemo(() => articles.filter((item) => item.dynamicContentId !== summary?.dynamicContentId && (!summary?.articleCategory || item.articleCategory === summary.articleCategory)).slice(0, 3), [articles, summary]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setFormMessage('لینک مقاله کپی شد.');
  };

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage('سرویس ثبت نظر مقاله هنوز در API فعال نشده است.');
  };

  if (loading) return <main className={styles.container}><div className={styles.skeletonTitle} /><div className={styles.skeletonImage} /><div className={styles.skeletonText} /><div className={styles.skeletonText} /></main>;
  if (error || !article) return <main className={styles.container}><div className={styles.error}><AlertCircle size={48} /><h2>{error || 'محتوایی یافت نشد'}</h2><Link href="/blog" className={styles.backToBlogBtn}>بازگشت به مجله کارنیکس</Link></div></main>;

  const articleDate = summary?.createdAt || article.publishDate;

  return (
    <main className={styles.page}>
      <div className={styles.breadcrumb}><Link href="/">صفحه اصلی</Link><span>/</span><Link href="/blog">مجله</Link><span>/</span><span>{article.title}</span></div>
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          {summary?.articleCategory && <span><Folder size={14} />{summary.articleCategory}</span>}
          {articleDate && <span><CalendarDays size={14} />{new Date(articleDate).toLocaleDateString('fa-IR')}</span>}
          <span><Clock3 size={14} />{summary?.readingTimeMinutes || 1} دقیقه مطالعه</span>
        </div>
      </header>

      <div className={styles.articleLayout}>
        <article className={styles.articleColumn}>
          <div className={styles.cover}><OptimizedImage src={summary?.imageUrl || '/images/article-cover-default.png'} alt={article.title} fill className={styles.coverImage} sizes="(max-width: 768px) 100vw, 850px" priority /></div>
          <div className={styles.bodyContent} dangerouslySetInnerHTML={{ __html: article.body }} />
          <div className={styles.shareRow}><span><Share2 size={16} /> اشتراک‌گذاری مقاله</span><button type="button" onClick={copyLink}><Copy size={15} /> کپی لینک</button></div>
        </article>

        {related.length > 0 && <aside className={styles.related}><h2>مقالات مرتبط</h2>{related.map((item) => <Link key={item.dynamicContentId} href={`/blog/${item.slug || item.dynamicContentId}`} className={styles.relatedCard}><div className={styles.relatedImage}><OptimizedImage src={item.imageUrl || '/images/article-cover-default.png'} alt={item.title} fill className={styles.coverImage} sizes="92px" /></div><div><h3>{item.title}</h3><span>{item.readingTimeMinutes || 1} دقیقه مطالعه</span></div></Link>)}</aside>}
        <section className={styles.comments}>
          <h2>نظرات کاربران درباره این مطلب</h2>
          <div className={styles.emptyComment}>هنوز نظری برای این مقاله ثبت نشده است. اولین نظر را شما بنویسید.</div>
          <form className={styles.commentForm} onSubmit={submitComment}>
            <h3>نظر خود را درباره این مطلب ثبت کنید</h3>
            <div className={styles.formRow}><input name="name" required placeholder="نام و نام خانوادگی" /><input name="email" type="email" required placeholder="ایمیل شما" /></div>
            <textarea name="comment" required minLength={3} placeholder="متن نظر" />
            <button type="submit">ثبت نظر</button>
          </form>
          {formMessage && <p className={styles.formMessage} role="status">{formMessage}</p>}
        </section>
      </div>
    </main>
  );
}
