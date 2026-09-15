'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, Clock3, Folder, TrendingUp } from 'lucide-react';
import BlogCard from '@/components/product/ProductInfo/BlogCard';
import BlogCategoryFilter from '@/components/product/ProductInfo/BlogCategoryFilter';
import BlogSort, { type BlogSortValue } from '@/components/product/ProductInfo/BlogSort';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';
import {
  ContentManagerApi,
  type ContentArchiveDto,
  type ContentSummaryDto,
} from '@/features/content/api/ContentManagerApi';
import styles from './BlogArchive.module.scss';

const extractArchive = (value: unknown): ContentArchiveDto => {
  if (!value || typeof value !== 'object') return { items: [], totalCount: 0, pageNumber: 1, pageSize: 50 };
  const record = value as Record<string, unknown>;
  const payload = (record.data ?? record.mainResults ?? record) as Record<string, unknown>;
  const items = Array.isArray(payload.items)
    ? payload.items as ContentSummaryDto[]
    : Array.isArray(payload.mainResults)
      ? payload.mainResults as ContentSummaryDto[]
      : Array.isArray(payload.data)
        ? payload.data as ContentSummaryDto[]
        : [];

  return {
    items,
    totalCount: Number(payload.totalCount ?? items.length),
    pageNumber: Number(payload.pageNumber ?? 1),
    pageSize: Number(payload.pageSize ?? 50),
  };
};

export default function BlogArchivePage() {
  const [articles, setArticles] = useState<ContentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<BlogSortValue>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    const loadArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ContentManagerApi.getArticleArchive();
        if (!cancelled) setArticles(extractArchive(response.data).items);
      } catch {
        if (!cancelled) setError('دریافت مقالات با خطا روبه‌رو شد. دوباره تلاش کنید.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadArticles();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(
      articles
        .map((article) => article.articleCategory?.trim())
        .filter((category): category is string => Boolean(category)),
    )];
    return [{ id: 'all', name: 'همه مقالات' }, ...unique.map((name) => ({ id: name, name }))];
  }, [articles]);

  const featuredArticle = articles.find((article) => article.isFeatured) ?? articles[0];
  const featuredDate = featuredArticle?.createdAt
    ? new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(featuredArticle.createdAt))
    : null;
  const popularArticles = useMemo(
    () => articles
      .filter((article) => article.dynamicContentId !== featuredArticle?.dynamicContentId)
      .slice(0, 2),
    [articles, featuredArticle?.dynamicContentId],
  );

  const categoryArticles = useMemo(() => {
    const selectedArticles = activeCategory === 'all'
      ? articles
      : articles.filter((article) => article.articleCategory === activeCategory);

    // مقالهٔ منتخب و محبوب‌ها همیشه بالاتر نمایش داده می‌شوند و در فهرست پایین تکرار نمی‌شوند.
    const promotedIds = new Set([
      featuredArticle?.dynamicContentId,
      ...popularArticles.map((article) => article.dynamicContentId),
    ]);
    return selectedArticles
      .filter((article) => !promotedIds.has(article.dynamicContentId))
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'fa');
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      });
  }, [activeCategory, articles, featuredArticle?.dynamicContentId, popularArticles, sortBy]);

  const totalPages = Math.max(1, Math.ceil(categoryArticles.length / pageSize));
  const pagedArticles = categoryArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy]);

  return (
    <main className={styles.pageContainer}>
      

      {loading ? (
        <div className={styles.grid} aria-label="در حال دریافت مقالات">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className={styles.skeletonCard}><div className={styles.skeletonImage} /><div className={styles.skeletonText} /><div className={styles.skeletonText} /></div>)}
        </div>
      ) : error ? (
        <div className={styles.emptyState}><p>{error}</p></div>
      ) : articles.length ? (
        <>
          {featuredArticle && (
            <article className={styles.featuredArticle}>
              <div className={styles.featuredInner}>
                <Link href={`/blog/${featuredArticle.slug || featuredArticle.dynamicContentId}`} className={styles.featuredImage}>
                  <OptimizedImage
                    src={featuredArticle.imageUrl || '/images/article-cover-default.png'}
                    alt={featuredArticle.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 720px) 100vw, 520px"
                  />
                </Link>
                <div className={styles.featuredContent}>
                  <h2>{featuredArticle.title}</h2>
                  <div className={styles.featuredMeta}>
                    {featuredArticle.articleCategory && <span><Folder size={13} /> {featuredArticle.articleCategory}</span>}
                    {featuredDate && <span><CalendarDays size={13} /> {featuredDate}</span>}
                    <span><Clock3 size={13} /> {featuredArticle.readingTimeMinutes || 1} دقیقه مطالعه</span>
                  </div>
                  <p>{featuredArticle.excerpt}</p>
                  <Link href={`/blog/${featuredArticle.slug || featuredArticle.dynamicContentId}`} className={styles.featuredLink}>
                    مطالعه مقاله <ArrowLeft size={17} />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {popularArticles.length > 0 && (
            <section className={styles.popularSection} aria-label="محبوب‌ترین مقاله‌ها">
              <div className={styles.sectionHeading}>
                <h2><TrendingUp size={19} /> محبوب‌ترین مقاله‌ها</h2>
                <span>پیشنهاد مجله کارنیکس</span>
              </div>
              <div className={styles.popularGrid}>
                {popularArticles.map((article) => (
                  <article key={article.dynamicContentId} className={styles.popularCard}>
                    <Link href={`/blog/${article.slug || article.dynamicContentId}`} className={styles.popularImage}>
                      <OptimizedImage
                        src={article.imageUrl || '/images/article-cover-default.png'}
                        alt={article.title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 720px) 110px, 260px"
                      />
                    </Link>
                    <div>
                      {article.articleCategory && <span className={styles.categoryLabel}>{article.articleCategory}</span>}
                      <Link href={`/blog/${article.slug || article.dynamicContentId}`}><h3>{article.title}</h3></Link>
                      <p>{article.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={styles.categorySection} aria-label="دسته‌بندی مطالب">
            <div className={styles.sectionHeading}>
              <h2>دسته‌بندی مطالب</h2>
              <span>مقاله‌ها را بر اساس موضوع ببینید</span>
            </div>
            <BlogCategoryFilter
              categories={categories}
              activeCategoryId={activeCategory}
              onSelect={(category) => {
                setActiveCategory(String(category));
                setCurrentPage(1);
              }}
            />
          </section>

          {categoryArticles.length > 0 ? (
            <section className={styles.articlesSection} aria-label="فهرست مقالات">
              <div className={styles.sectionHeading}><h2>{activeCategory === 'all' ? 'همه مقالات' : activeCategory}</h2><BlogSort value={sortBy} onChange={setSortBy} /></div>
              <div className={styles.grid}>
                {pagedArticles.map((article) => <BlogCard key={article.dynamicContentId} article={article} />)}
              </div>
              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="صفحه‌بندی مقالات">
                  <button type="button" className={styles.pageButton} disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)}>قبلی</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((page) => (
                    <button type="button" key={page} className={`${styles.pageButton} ${page === currentPage ? styles.activePage : ''}`} onClick={() => setCurrentPage(page)} aria-current={page === currentPage ? 'page' : undefined}>{page.toLocaleString('fa-IR')}</button>
                  ))}
                  {totalPages > 5 && <><span className={styles.pageDots}>...</span><button type="button" className={styles.pageButton} onClick={() => setCurrentPage(totalPages)}>{totalPages.toLocaleString('fa-IR')}</button></>}
                  <button type="button" className={styles.pageButton} disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)}>بعدی</button>
                </nav>
              )}
            </section>
          ) : <div className={styles.emptyState}><p>برای این دسته هنوز مقالهٔ دیگری منتشر نشده است.</p></div>}
        </>
      ) : (
        <div className={styles.emptyState}><p>برای این دسته هنوز مقاله‌ای منتشر نشده است.</p></div>
      )}
    </main>
  );
}
