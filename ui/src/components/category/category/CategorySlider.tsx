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
  // 🟢 شرط !c.parentCategoryId اضافه شد تا هم null هم 0 را در نظر بگیرد
  const mainCategories = categories.filter((c) => !c.parentCategoryId || c.parentCategoryId === 0);

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
        cssMode={false}
        touchStartPreventDefault={false}
        breakpoints={{
          0: { slidesPerView: 3, spaceBetween: 6 },
          400: { slidesPerView: 3, spaceBetween: 8 },
          576: { slidesPerView: 3, spaceBetween: 10 },
          768: { slidesPerView: 4, spaceBetween: 12 },
          992: { slidesPerView: 5, spaceBetween: 16 },
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