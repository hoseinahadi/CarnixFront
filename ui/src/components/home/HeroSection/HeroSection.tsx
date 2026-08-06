'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from './HeroSection.module.scss';
import Image from 'next/image';

import Image1 from '@/assets/images/slider/hero-bg-1.jpg';
import Image2 from '@/assets/images/slider/hero-bg-2.jpg';
import HeroSearchForm from '@/features/search/components/heroSearch/HeroSearch';

const slides = [
  { id: 1, image: Image1, alt: 'موتور ماشین' },
  { id: 2, image: Image2, alt: 'قطعات یدکی' },
];

export const HeroSection = () => (
  <section className={styles.heroContainer}>
    <div className={styles.sliderWrapper}>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 20000, disableOnInteraction: false }}
        cssMode={false}
  touchStartPreventDefault={false}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        className={styles.swiperRoot}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className={styles.slideImage}
              priority
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.imageOverlay}></div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* دکمه‌های ناوبری */}
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>
    </div>

    <div className={styles.searchOverlay}>
      <div className={styles.searchBoxPlaceholder}>
        <HeroSearchForm/>
      </div>
    </div>
  </section>
);
