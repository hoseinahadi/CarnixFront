'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Category } from '@/models/category/Category';
import { CategoryItem } from './CategoryItem';

import 'swiper/css';
import 'swiper/css/navigation';
import styles from './styles.module.scss';

interface CategorySliderProps {
  categories: Category[];
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ categories }) => {
  const mainCategories = categories.filter((c) => c.parentCategoryId === null);

  if (mainCategories.length === 0) return null;

  return (
    <div className={styles.sliderContainer}>
      <Swiper
        modules={[Navigation]}
        spaceBetween={8}
        slidesPerView="auto"
        navigation={{
          nextEl: '.category-next',
          prevEl: '.category-prev',
        }}
        breakpoints={{
          // موبایل خیلی کوچک (زیر 400px): 4 دسته‌بندی
          0: { slidesPerView: 3, spaceBetween: 6 },
          // موبایل معمولی (400px تا 576px): 4 دسته‌بندی
          400: { slidesPerView: 3, spaceBetween: 8 },
          // موبایل بزرگ/تبلت کوچک (576px تا 768px): 5 دسته‌بندی
          576: { slidesPerView: 3, spaceBetween: 10 },
          // تبلت بزرگ (768px تا 992px): 6 دسته‌بندی
          768: { slidesPerView: 4, spaceBetween: 12 },
          // لپ‌تاپ (992px تا 1200px): 7 دسته‌بندی
          992: { slidesPerView: 5, spaceBetween: 16 },
          // دسکتاپ (1200px به بالا): 8 دسته‌بندی
          1200: { slidesPerView: 6, spaceBetween: 20 },
        }}
      >
        {mainCategories.map((category) => (
          <SwiperSlide key={category.categoryId} style={{ width: 'auto' }}>
            <CategoryItem category={category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};