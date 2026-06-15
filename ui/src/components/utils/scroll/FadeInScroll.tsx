'use client' // اگر از Next.js App Router استفاده می‌کنید این خط الزامی است
import React, { useEffect, useRef, useState } from 'react';

// استایل‌های درون‌خطی (می‌توانید به فایل CSS منتقل کنید)
const styles = {
  hidden: {
    opacity: 0,
    transform: 'translateY(50px)', // ۵۰ پیکسل پایین‌تر است
    transition: 'opacity 0.8s ease-out, transform 0.5s ease-out',
  },
  visible: {
    opacity: 1,
    transform: 'translateY(0)', // به جای اصلی خود برمی‌گردد
  }
};

export const FadeInScroll = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // وقتی المان وارد کادر نمایش شد (10 درصد آن دیده شد)
        if (entry.isIntersecting) {
          setIsVisible(true);
          // اگر می‌خواهید انیمیشن فقط یک بار اجرا شود خط زیر را از کامنت در بیاورید
          // if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={isVisible ? { ...styles.hidden, ...styles.visible } : styles.hidden}
    >
      {children}
    </div>
  );
};
