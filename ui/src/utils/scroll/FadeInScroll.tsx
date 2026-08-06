'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface FadeInScrollProps {
  children: ReactNode;
  className?: string;
}

export const FadeInScroll: React.FC<FadeInScrollProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        touchAction: 'pan-y', // 👈 این خط رو اضافه کن
      }}
    >
      {children}
    </div>
  );
};