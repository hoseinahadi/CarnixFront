'use client';

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dialog.module.scss';

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
}

export default function Dialog({ open, onClose, title, children, closeOnBackdrop = true, overlayClassName = '', contentClassName = '' }: DialogProps) {
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      const first = contentRef.current?.querySelector<HTMLElement>(focusableSelector);
      (first ?? contentRef.current)?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab' || !contentRef.current) return;
      const focusable = [...contentRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) { event.preventDefault(); contentRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;
  const stopPropagation = (event: MouseEvent) => event.stopPropagation();
  return createPortal(
    <div className={`${styles.overlay} ${overlayClassName}`} onMouseDown={closeOnBackdrop ? onClose : undefined}>
      <div ref={contentRef} className={`${styles.content} ${contentClassName}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onMouseDown={stopPropagation}>
        <h2 id={titleId} className={styles.srOnly}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
