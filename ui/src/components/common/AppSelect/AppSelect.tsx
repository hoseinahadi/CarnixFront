'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './AppSelect.module.scss';

export interface AppSelectOption { value: string; label: string; }
interface AppSelectProps { value: string; onChange: (value: string) => void; options: AppSelectOption[]; placeholder?: string; ariaLabel: string; className?: string; }

export default function AppSelect({ value, onChange, options, placeholder = 'انتخاب کنید', ariaLabel, className = '' }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return <div className={`${styles.root} ${className}`} ref={rootRef}>
    <button type="button" className={`${styles.trigger} ${open ? styles.open : ''}`} onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="listbox" aria-label={ariaLabel}>
      <span className={selected ? styles.value : styles.placeholder}>{selected?.label ?? placeholder}</span><ChevronDown className={styles.chevron} size={20} aria-hidden="true" />
    </button>
    {open && <div className={styles.menu} role="listbox" aria-label={ariaLabel}>{options.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} className={option.value === value ? styles.selected : ''} onClick={() => { onChange(option.value); setOpen(false); }}>{option.label}</button>)}</div>}
  </div>;
}
