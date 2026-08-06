'use client';

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

interface LazyMountProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  rootMargin?: string;
  minHeight?: number | string;
}

/**
 * فرزندان را فقط زمانی Mount می‌کند که سکشن
 * به محدوده دید کاربر نزدیک شود.
 *
 * در نتیجه useEffectها و درخواست‌های API داخل سکشن
 * قبل از نیاز کاربر اجرا نمی‌شوند.
 */
export default function LazyMount({
  children,
  fallback = null,
  className,
  rootMargin = '500px 0px',
  minHeight = 0,
}: LazyMountProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) {
      return;
    }

    const element = containerRef.current;

    if (!element) {
      return;
    }

    /*
     * در مرورگرهای قدیمی که IntersectionObserver ندارند،
     * محتوا بلافاصله نمایش داده می‌شود تا صفحه خراب نشود.
     */
    if (!('IntersectionObserver' in window)) {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setShouldMount(true);

        /*
         * بعد از اولین Mount دیگر نیازی به Observer نداریم.
         * محتوا پس از خارج‌شدن از Viewport نیز Mount باقی می‌ماند.
         */
        observer.disconnect();
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, shouldMount]);

  const placeholderStyle: CSSProperties | undefined =
    shouldMount
      ? undefined
      : {
          minHeight,
        };

  return (
    <div
      ref={containerRef}
      className={className}
      style={placeholderStyle}
    >
      {shouldMount ? children : fallback}
    </div>
  );
}