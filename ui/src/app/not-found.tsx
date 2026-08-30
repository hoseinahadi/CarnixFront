import Link from 'next/link';
import { ArrowRight, CarFront, Home, Search } from 'lucide-react';

import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.backgroundShape} aria-hidden="true" />

      <section className={styles.card} aria-labelledby="not-found-title">
        <div className={styles.visual} aria-hidden="true">
          <span className={styles.number}>۴۰۴</span>
          <div className={styles.road}>
            <span className={styles.roadLine} />
            <span className={styles.carIcon}>
              <CarFront size={42} strokeWidth={1.7} />
            </span>
          </div>
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow}>مسیر پیدا نشد</span>
          <h1 id="not-found-title" className={styles.title}>
            انگار این صفحه از مسیر خارج شده!
          </h1>
          <p className={styles.description}>
            آدرسی که وارد کرده‌اید وجود ندارد، حذف شده یا به مسیر دیگری منتقل شده است.
            از گزینه‌های زیر می‌توانید دوباره به مسیر درست برگردید.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryAction}>
              <Home size={20} />
              <span>بازگشت به صفحه اصلی</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/products" className={styles.secondaryAction}>
              <Search size={20} />
              <span>مشاهده محصولات</span>
            </Link>
          </div>

          <div className={styles.quickLinks}>
            <span>مسیرهای پیشنهادی:</span>
            <Link href="/vehicles">ماشین‌ها</Link>
            <Link href="/brands">برندها</Link>
            <Link href="/faq">سوالات متداول</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
