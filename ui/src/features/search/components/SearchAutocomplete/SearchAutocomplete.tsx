'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDebounce } from '@/features/search/hooks/useDebounce';
import styles from './SearchAutocomplete.module.scss';
import { Search, TrendingUp, ChevronLeft } from 'lucide-react';
import { SearchSuggestion } from "@/models/search/SearchSuggestion";

import { searchApi } from '@/features/search/api/routes';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const normalizedDebouncedQuery = debouncedQuery.trim();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // بستن دراپ‌دان هنگام تغییر مسیر
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsOpen(false);
      setQuery('');
      setSuggestions([]);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // 🟢 جستجو با تاخیر و کنترل دقیق چرخه حیات (رفع Memory Leak و Race Condition)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true; 

    if (normalizedDebouncedQuery.length > 2) {
      setIsLoading(true);
      
      // 🟢 اصلاح شد: فراخوانی متد getSuggestions از داخل آبجکت searchApi
      searchApi.getSuggestions(normalizedDebouncedQuery, controller.signal)
        .then((data: any) => {
          if (isMounted) {
            setSuggestions(data || []);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setSuggestions([]);
            setIsLoading(false);
          }
        });
        
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      isMounted = false; 
      controller.abort();
    };
  }, [normalizedDebouncedQuery]);

  // قفل شمارنده‌دار؛ cleanup یک overlay دیگر را باز نمی‌کند.
  useBodyScrollLock(isOpen);

  const openDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className={`${styles.searchContainer} ${isOpen ? styles.activeContainer : ''}`}>
      
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}

      <div
        className={`${styles.searchBox} ${isOpen ? styles.active : ''}`}
        onClick={openDropdown}
      >
        <Search className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="جستجوی نام یا کد قطعه..."
          className={isOpen ? styles.inputOpen : styles.input}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {query.trim().length === 0 && (
            <div className={styles.defaultState}>
              <div className={styles.sectionHeader}>
                <TrendingUp size={16} />
                <span>جستجوهای پرطرفدار</span>
              </div>
              <div className={styles.popularTags}>
                <span className={styles.tag}>لنت ترمز ۲۰۶</span>
                <span className={styles.tag}>تسمه تایم ال ۹۰</span>
                <span className={styles.tag}>شمع موتور بوش</span>
                <span className={styles.tag}>روغن موتور الف</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.sectionHeader}>
                <span>دسته‌بندی‌های محبوب</span>
              </div>
              <ul className={styles.popularCategories}>
                <li>
                  <Link href="/category/brakes" onClick={() => setIsOpen(false)}>
                    سیستم ترمز <ChevronLeft size={14}/>
                  </Link>
                </li>
                <li>
                  <Link href="/category/engine" onClick={() => setIsOpen(false)}>
                    قطعات موتوری <ChevronLeft size={14}/>
                  </Link>
                </li>
                <li>
                  <Link href="/category/filters" onClick={() => setIsOpen(false)}>
                    فیلتر و روغن <ChevronLeft size={14}/>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {query.trim().length > 0 && isLoading && (
            <div className={styles.statusMessage}>
              <div className={styles.spinner} />
              <span>در حال جستجوی "{query}"...</span>
            </div>
          )}

          {query.trim().length > 0 && !isLoading && suggestions.length > 0 && (
            <div className={styles.resultsList}>
              {suggestions.map((item, index) => (
                <Link
                  href={`/${item.type}/${item.slug}`}
                  key={`suggestion-${item.type}-${item.id}-${index}`}
                  className={styles.suggestionItem}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.title}</span>
                    {item.partNumber && (
                      <span className={styles.itemMeta}>کد: {item.partNumber}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.trim().length > 2 && !isLoading && suggestions.length === 0 && (
            <div className={styles.statusMessage}>
              قطعه‌ای یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
}