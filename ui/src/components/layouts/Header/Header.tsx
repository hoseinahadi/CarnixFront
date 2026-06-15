'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Header.module.scss';
import TopHeader from './TopHeader/TopHeader';
import BottomHeader from './BottomHeader/BottomHeader';
import MobileMenu from './MobileMenu/MobileMenu';
import { useMobileMenu } from '@/hooks/useMobileMenu';

const Header = () => {
  const [showBottom, setShowBottom] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setShowBottom(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.3,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        style={{ height: '1px', width: '100%', marginTop: 0 }}
      />

      <header className={styles.container}>
        <TopHeader 
          onMenuClick={toggleMenu} 
          isMenuOpen={isOpen}
        />

        <div
          className={`${styles.bottomHeaderContainer} ${
            showBottom ? styles.visible : styles.hidden
          }`}
        >
          <BottomHeader />
        </div>
      </header>

      <MobileMenu 
        isOpen={isOpen} 
        onClose={closeMenu} 
      />
    </>
  );
};

export default Header;