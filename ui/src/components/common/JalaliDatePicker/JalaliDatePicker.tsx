'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Dialog from '@/components/common/Dialog/Dialog';
import styles from './JalaliDatePicker.module.scss';

interface JalaliDatePickerProps { value: string; onChange: (value: string) => void; id?: string; daysAhead?: number; pastYears?: number; }
interface CalendarDate { value: string; date: Date; day: string; month: string; year: string; weekday: string; }
const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function JalaliDatePicker({ value, onChange, id, daysAhead = 90, pastYears = 0 }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(0);
  const dates = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date();
    const start = new Date(today); start.setFullYear(today.getFullYear() - pastYears); start.setHours(12, 0, 0, 0);
    return Array.from({ length: pastYears * 366 + daysAhead + 1 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      const parts = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
      return { value: toIsoDate(date), date, day: parts.day, month: parts.month, year: parts.year, weekday: parts.weekday } as CalendarDate;
    });
  }, [daysAhead, pastYears]);
  const months = useMemo(() => Object.values(dates.reduce<Record<string, CalendarDate[]>>((result, date) => { const key = `${date.year}-${date.month}`; (result[key] ??= []).push(date); return result; }, {})), [dates]);
  const month = months[activeMonth] ?? months[0];
  const selected = dates.find((date) => date.value === value);
  const weekOffset = month ? (month[0].date.getDay() + 1) % 7 : 0;
  const choose = (date: CalendarDate) => { onChange(date.value); setOpen(false); };
  const openCalendar = () => { const selectedMonth = months.findIndex((items) => items.some((item) => item.value === value)); setActiveMonth(selectedMonth >= 0 ? selectedMonth : pastYears > 0 ? Math.max(0, months.length - 1) : 0); setOpen(true); };

  return <div className={styles.wrapper}>
    <button id={id} type="button" className={styles.trigger} onClick={openCalendar} aria-haspopup="dialog"><span className={value ? styles.selectedText : styles.placeholder}>{selected ? `${selected.weekday}، ${selected.day} ${selected.month} ${selected.year}` : 'تاریخ نوبت را انتخاب کنید'}</span><CalendarDays className={styles.icon} size={20} aria-hidden="true" /></button>
    <Dialog open={open} onClose={() => setOpen(false)} title="انتخاب تاریخ نوبت" contentClassName={styles.modal}>
      {month && <div className={styles.calendar} dir="rtl"><div className={styles.modalHeader}><button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="بستن"><X size={20} /></button><strong>{month[0].month} {month[0].year}</strong><div className={styles.monthActions}><button type="button" onClick={() => setActiveMonth((index) => Math.max(0, index - 1))} disabled={activeMonth === 0} aria-label="ماه قبل"><ChevronRight size={20} /></button><button type="button" onClick={() => setActiveMonth((index) => Math.min(months.length - 1, index + 1))} disabled={activeMonth === months.length - 1} aria-label="ماه بعد"><ChevronLeft size={20} /></button></div></div><div className={styles.weekdays}>{['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day) => <span key={day}>{day}</span>)}</div><div className={styles.days}>{Array.from({ length: weekOffset }).map((_, index) => <span key={`blank-${index}`} />)}{month.map((date) => <button type="button" key={date.value} className={date.value === value ? styles.activeDay : ''} onClick={() => choose(date)}>{date.day}</button>)}</div></div>}
    </Dialog>
  </div>;
}
