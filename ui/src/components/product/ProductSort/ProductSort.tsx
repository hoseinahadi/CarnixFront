'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  IconArrowsSort,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

import classNames from 'classnames';

import type {
  SortOption,
} from '@/models/product/ProductFilters';

import {
  selectActiveFilters,
} from '@/store/feature/product/productFilterSelectors';

import { useAppSelector } from '@/store/hooks';

import styles from './ProductSort.module.scss';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ProductSortProps {
  onSortChange: (sortBy: SortOption) => void;
}

const SORT_OPTIONS: ReadonlyArray<{
  value: SortOption;
  label: string;
}> = [
  {
    value: 'newest',
    label: 'جدیدترین',
  },
  {
    value: 'cheapest',
    label: 'ارزان‌ترین',
  },
  {
    value: 'expensive',
    label: 'گران‌ترین',
  },
  {
    value: 'discounted',
    label: 'بیشترین تخفیف',
  },
];

const ProductSort = ({
  onSortChange,
}: ProductSortProps) => {
  const activeFilters = useAppSelector(
    selectActiveFilters,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort =
    SORT_OPTIONS.find(
      (option) =>
        option.value === activeFilters.sortBy,
    ) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener(
        'resize',
        checkMobile,
      );
    };
  }, []);

  const handleSort = (value: SortOption) => {
    setIsOpen(false);

    if (activeFilters.sortBy === value) {
      return;
    }

    /*
     * این کامپوننت دیگر API را صدا نمی‌زند.
     * Parent فقط URL را تغییر می‌دهد و Controller یک Fetch انجام می‌دهد.
     */
    onSortChange(value);
  };

  useEffect(() => {
    if (isMobile || !isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [isOpen]);

  useBodyScrollLock(isOpen && isMobile);

  return (
    <div
      className={styles.sortContainer}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="مرتب‌سازی"
        aria-expanded={isOpen}
      >
        <IconArrowsSort size={18} />
        <span className={styles.sortLabel}>
          {currentSort.label}
        </span>
      </button>

      {isOpen && !isMobile && (
        <div className={styles.dropdown}>
          {SORT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={classNames(
                styles.dropdownItem,
                {
                  [styles.active]:
                    activeFilters.sortBy ===
                    option.value,
                },
              )}
              onClick={() =>
                handleSort(option.value)
              }
            >
              <span>{option.label}</span>

              {activeFilters.sortBy ===
                option.value && (
                <IconCheck
                  size={16}
                  className={styles.checkIcon}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && isMobile && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />

          <div className={styles.bottomSheet}>
            <div
              className={styles.bottomSheetHeader}
            >
              <h3
                className={styles.bottomSheetTitle}
              >
                مرتب‌سازی
              </h3>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="بستن"
              >
                <IconX size={20} />
              </button>
            </div>

            <div
              className={styles.bottomSheetContent}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={classNames(
                    styles.radioItem,
                    {
                      [styles.radioActive]:
                        activeFilters.sortBy ===
                        option.value,
                    },
                  )}
                  onClick={() =>
                    handleSort(option.value)
                  }
                >
                  <div className={styles.radioCircle}>
                    {activeFilters.sortBy ===
                      option.value && (
                      <div className={styles.radioDot} />
                    )}
                  </div>

                  <span className={styles.radioLabel}>
                    {option.label}
                  </span>

                  {activeFilters.sortBy ===
                    option.value && (
                    <IconCheck
                      size={16}
                      className={styles.checkIcon}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSort;
