import { useCallback, useState } from 'react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  // شمارنده‌دار است و با Search/Modal/ProfileSidebar تداخل نمی‌کند.
  useBodyScrollLock(isOpen);

  const toggleMenu = useCallback(() => setIsOpen((current) => !current), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    toggleMenu,
    closeMenu,
  };
};
