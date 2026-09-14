'use client';

import { useEffect, useRef, useState } from 'react';
import { IconArrowsSort, IconCheck, IconX } from '@tabler/icons-react';
import classNames from 'classnames';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import styles from '../ProductSort/ProductSort.module.scss';

export type BlogSortValue = 'displayOrder' | 'newest' | 'title';

const OPTIONS: ReadonlyArray<{ value: BlogSortValue; label: string }> = [
  { value: 'displayOrder', label: 'ترتیب پیش‌فرض' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'title', label: 'الفبایی' },
];

export default function BlogSort({ value, onChange }: { value: BlogSortValue; onChange: (value: BlogSortValue) => void }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  useEffect(() => {
    const update = () => setMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!open || mobile) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, mobile]);

  useBodyScrollLock(open && mobile);

  const select = (next: BlogSortValue) => {
    setOpen(false);
    onChange(next);
  };

  return (
    <div className={`${styles.sortContainer} ${styles.blogSort}`} ref={ref}>
      <button type="button" className={styles.sortButton} onClick={() => setOpen((state) => !state)} aria-label="مرتب‌سازی مقالات" aria-expanded={open}>
        <IconArrowsSort size={18} />
        <span className={styles.sortLabel}>{current.label}</span>
      </button>
      {open && !mobile && <div className={styles.dropdown}>{OPTIONS.map((option) => <button type="button" key={option.value} className={classNames(styles.dropdownItem, { [styles.active]: value === option.value })} onClick={() => select(option.value)}><span>{option.label}</span>{value === option.value && <IconCheck size={16} className={styles.checkIcon} />}</button>)}</div>}
      {open && mobile && <><div className={styles.overlay} onClick={() => setOpen(false)} /><div className={styles.bottomSheet}><div className={styles.bottomSheetHeader}><h3 className={styles.bottomSheetTitle}>مرتب‌سازی</h3><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="بستن"><IconX size={20} /></button></div><div className={styles.bottomSheetContent}>{OPTIONS.map((option) => <button type="button" key={option.value} className={classNames(styles.radioItem, { [styles.radioActive]: value === option.value })} onClick={() => select(option.value)}><div className={styles.radioCircle}>{value === option.value && <div className={styles.radioDot} />}</div><span className={styles.radioLabel}>{option.label}</span>{value === option.value && <IconCheck size={16} className={styles.checkIcon} />}</button>)}</div></div></>}
    </div>
  );
}
