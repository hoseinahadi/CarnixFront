import React from 'react';
import Link from 'next/link';
import styles from './BulkPurchaseBanner.module.scss';

const BulkPurchaseBanner: React.FC = () => {
  return (
    <section className={styles.bannerWrapper}>
      <div className={styles.bannerContent}>
        <h2 className={styles.title}>آیا می خواهید خرید عمده داشته باشید؟</h2>
        
        {/* لینک به صفحه فرم ثبت نام خرید عمده */}
        <Link href="/bulk-purchase" className={styles.actionButton}>
          ثبت درخواست
        </Link>
      </div>
    </section>
  );
};

export default BulkPurchaseBanner;
