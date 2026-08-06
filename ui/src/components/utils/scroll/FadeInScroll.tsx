'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

interface FadeInScrollProps {
  children: ReactNode;
  className?: string;
}

const hiddenStyle = {
  opacity: 0,
  transform: 'translateY(32px)',
  transition:
    'opacity 0.6s ease-out, transform 0.6s ease-out',
} as const;

const visibleStyle = {
  opacity: 1,
  transform: 'translateY(0)',
} as const;

export const FadeInScroll = ({
  children,
  className,
}: FadeInScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || isVisible) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: '100px 0px',
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        isVisible
          ? { ...hiddenStyle, ...visibleStyle }
          : hiddenStyle
      }
    >
      {children}
    </div>
  );
};
