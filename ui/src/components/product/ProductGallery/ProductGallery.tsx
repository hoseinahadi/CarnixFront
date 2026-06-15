'use client';
import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import styles from './ProductGallery.module.scss';
import { Heart, Share2, Bell } from 'lucide-react'; 

// ایمپورت کردن مستقیم عکس‌ها از پوشه assets
import img1 from '@/assets/images/products/car-part-1.jpg';
import img2 from '@/assets/images/products/car-part-2.jpg';
import img3 from '@/assets/images/products/car-part-3.jpg';
import img4 from '@/assets/images/products/car-part-4.jpg';
import img5 from '@/assets/images/products/car-part-5.jpg';

// حالا آرایه شما شامل آبجکت‌های پردازش شده توسط Next.js است
const MOCK_IMAGES: StaticImageData[] = [img1, img2, img3, img4, img5];

interface ProductGalleryProps {
  slug: string; 
}

export default function ProductGallery({ slug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.galleryContainer}>
      
      {/* بخش تصویر اصلی و آیکون‌های عملیاتی */}
      <div className={styles.mainImageWrapper}>
        <div className={styles.actionIcons}>
          <button className={styles.iconBtn} aria-label="افزودن به علاقه‌مندی‌ها">
            <Heart size={24} />
          </button>
          <button className={styles.iconBtn} aria-label="اشتراک‌گذاری">
            <Share2 size={24} />
          </button>
          <button className={styles.iconBtn} aria-label="اطلاع‌رسانی">
            <Bell size={24} />
          </button>
        </div>

        {/* تصویر اصلی */}
        <div className={styles.mainImage}>
          <Image
            src={MOCK_IMAGES[activeIndex]} // حالا یک آبجکت معتبر است
            alt={`تصویر محصول ${slug}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className={styles.imageConfig}
            priority
          />
        </div>
      </div>

      {/* بخش تصاویر کوچک (Thumbnails) در پایین */}
      <div className={styles.thumbnailList}>
        {MOCK_IMAGES.map((img, index) => (
          <button
            key={index}
            className={`${styles.thumbnailItem} ${
               activeIndex === index ? styles.activeThumbnail : ''
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={img} // آبجکت ایمپورت شده
              alt={`تصویر کوچک ${index + 1}`}
              fill
              sizes="80px"
              className={styles.imageConfig}
            />
          </button>
        ))}
      </div>

    </div>
  );
}
