'use client';

import dynamic from 'next/dynamic';

import { HeroSection } from '@/components/home/HeroSection/HeroSection';
import LazyMount from '@/components/utils/lazy/LazyMount';
import { FadeInScroll } from '@/components/utils/scroll/FadeInScroll';
import styles from './Home.module.scss';

interface SectionSkeletonProps {
  type?: 'cards' | 'banner' | 'categories';
}

const SectionSkeleton = ({
  type = 'cards',
}: SectionSkeletonProps) => {
  const pulseStyle = {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    animation: 'pulse-skeleton 1.5s infinite ease-in-out',
  } as const;

  return (
    <div
      aria-hidden="true"
      style={{
        padding: '20px 0',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pulse-skeleton {
          0% { opacity: 1; background-color: #f3f4f6; }
          50% { opacity: 0.6; background-color: #e5e7eb; }
          100% { opacity: 1; background-color: #f3f4f6; }
        }
      `}</style>

      <div
        style={{
          width: '200px',
          height: '28px',
          marginBottom: '24px',
          ...pulseStyle,
        }}
      />

      {type === 'cards' && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              style={{
                flex: '1',
                minWidth: '220px',
                height: '340px',
                ...pulseStyle,
              }}
            />
          ))}
        </div>
      )}

      {type === 'categories' && (
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  ...pulseStyle,
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '14px',
                  ...pulseStyle,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {type === 'banner' && (
        <div
          style={{
            width: '100%',
            height: '200px',
            ...pulseStyle,
          }}
        />
      )}
    </div>
  );
};

const CategorySliderWidget = dynamic(
  () => import('@/components/category/category'),
  {
    loading: () => <SectionSkeleton type="categories" />,
  },
);

const BestSellersSection = dynamic(
  () =>
    import(
      '@/components/home/BestSellersSection/BestSellersSection'
    ),
  {
    loading: () => <SectionSkeleton type="cards" />,
  },
);
// Test
// Test
// Test
// Test
// Test
// Test

const NewestProductsSection = dynamic(
  () =>
    import(
      '@/components/home/NewestProductsSection/NewestProductsSection'
    ),
  {
    loading: () => <SectionSkeleton type="cards" />,
  },
);

const BulkPurchaseBanner = dynamic(
  () =>
    import(
      '@/components/home/BulkPurchaseBanner/BulkPurchaseBanner'
    ),
  {
    loading: () => <SectionSkeleton type="banner" />,
  },
);

const FeaturedProductsSection = dynamic(
  () =>
    import(
      '@/components/home/FeaturedProductsSection/FeaturedProductsSection'
    ),
  {
    loading: () => <SectionSkeleton type="cards" />,
  },
);

const ArticlesSection = dynamic(
  () =>
    import(
      '@/components/home/ArticlesSection/ArticlesSection'
    ),
  {
    loading: () => <SectionSkeleton type="cards" />,
  },
);

const Home = () => {
  return (
    <div className={styles.home}>
      <HeroSection />

      <section className={styles.section}>
        <LazyMount
          rootMargin="250px 0px"
          minHeight={180}
          fallback={<SectionSkeleton type="categories" />}
        >
          <FadeInScroll>
            <CategorySliderWidget />
          </FadeInScroll>
        </LazyMount>
      </section>

      <section className={styles.section}>
        <LazyMount
          rootMargin="250px 0px"
          minHeight={420}
          fallback={<SectionSkeleton type="cards" />}
        >
          <FadeInScroll>
            <BestSellersSection />
          </FadeInScroll>
        </LazyMount>
      </section>

      <section className={styles.section}>
        <LazyMount
          rootMargin="200px 0px"
          minHeight={240}
          fallback={<SectionSkeleton type="banner" />}
        >
          <FadeInScroll>
            <BulkPurchaseBanner />
          </FadeInScroll>
        </LazyMount>
      </section>

      <section className={`${styles.section} ${styles.featured}`}>
        <LazyMount
          rootMargin="200px 0px"
          minHeight={420}
          fallback={<SectionSkeleton type="cards" />}
        >
          <FadeInScroll>
            <FeaturedProductsSection />
          </FadeInScroll>
        </LazyMount>
      </section>

      <section className={styles.section}>
        <LazyMount
          rootMargin="200px 0px"
          minHeight={420}
          fallback={<SectionSkeleton type="cards" />}
        >
          <FadeInScroll>
            <NewestProductsSection />
          </FadeInScroll>
        </LazyMount>
      </section>

      <section className={styles.section}>
        <LazyMount
          rootMargin="150px 0px"
          minHeight={360}
          fallback={<SectionSkeleton type="cards" />}
        >
          <FadeInScroll>
            <ArticlesSection />
          </FadeInScroll>
        </LazyMount>
      </section>
    </div>
  );
};

export default Home;
