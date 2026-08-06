
'use client';

import {
  useEffect,
} from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  AppDispatch,
  RootState,
} from '@/store';

import {
  fetchCategories,
} from '@/store/feature/Category/categoryThunks';

import {
  CategorySlider,
} from './CategorySlider';

import styles from './styles.module.scss';

export const CategorySliderWidget = () => {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    categories,
    loading,
    error,
    fetchStatus = 'idle',
  } = useSelector(
    (state: RootState) =>
      state.category,
  );

  useEffect(() => {
    if (fetchStatus === 'idle') {
      void dispatch(fetchCategories());
    }
  }, [
    dispatch,
    fetchStatus,
  ]);

  if (
    loading &&
    categories.length === 0
  ) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        در حال بارگذاری دسته‌بندی‌ها...
      </div>
    );
  }

  if (
    error ||
    categories.length === 0
  ) {
    return null;
  }

  return (
    <section className="container-max-width my-xxxl">
      <div className={styles.header}>
        <h2 className={styles.titleCat}>
          دسته بندی ها
        </h2>

        <div className={styles.navWrapper}>
          <button
            type="button"
            aria-label="دسته‌بندی قبلی"
            className={
              `category-prev ${styles.customNavBtn}`
            }
          >
            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            aria-label="دسته‌بندی بعدی"
            className={
              `category-next ${styles.customNavBtn}`
            }
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <CategorySlider
        categories={categories}
      />
    </section>
  );
};

export default CategorySliderWidget;
