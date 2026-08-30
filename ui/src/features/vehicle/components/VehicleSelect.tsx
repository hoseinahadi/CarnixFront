'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Car, ChevronDown, Loader2, Search } from 'lucide-react';
import classNames from 'classnames';

import type { VehicleMake, VehicleModel } from '@/models/Vehicle/Vehicle';
import { VehicleApi } from '../api/VehicleApi';
import styles from './VehicleSelect.module.scss';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function VehicleSelect({
  value,
  onChange,
  placeholder = 'انتخاب خودرو',
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeRequestIdRef = useRef(0);

  const loadMakes = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError('');

    try {
      const response = await VehicleApi.getAllMakes();
      if (requestId !== activeRequestIdRef.current) return;

      setMakes(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch {
      if (requestId === activeRequestIdRef.current) {
        setError('خطا در دریافت برندها');
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadModels = useCallback(async (makeId: number) => {
    const requestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError('');
    setModels([]);

    try {
      const response = await VehicleApi.getModelsByMakeId(makeId);
      if (requestId !== activeRequestIdRef.current) return;

      setModels(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch {
      if (requestId === activeRequestIdRef.current) {
        setError('خطا در دریافت مدل‌ها');
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      // پاسخ requestهای درحال اجرا بعد از unmount دیگر حق تغییر state ندارند.
      activeRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && makes.length === 0 && !loading && !error) {
      void loadMakes();
    }
  }, [error, isOpen, loadMakes, loading, makes.length]);

  useEffect(() => {
    if (selectedMake) {
      void loadModels(selectedMake.vehicleMakeId);
    }
  }, [loadModels, selectedMake]);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  const handleMakeSelect = (make: VehicleMake) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSearchTerm('');
  };

  const handleModelSelect = (model: VehicleModel) => {
    setSelectedModel(model);
    onChange(`${selectedMake?.name ?? ''} - ${model.name}`.replace(/^\s*-\s*/, ''));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleBackToMakes = () => {
    activeRequestIdRef.current += 1;
    setLoading(false);
    setError('');
    setSelectedMake(null);
    setSelectedModel(null);
    setModels([]);
    setSearchTerm('');
  };

  const handleRetry = () => {
    if (selectedMake) {
      void loadModels(selectedMake.vehicleMakeId);
    } else {
      void loadMakes();
    }
  };

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fa-IR');
  const filteredMakes = makes.filter((make) => {
    if (!normalizedSearch) return true;
    return (
      make.name?.toLocaleLowerCase('fa-IR').includes(normalizedSearch) ||
      make.englishName?.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  });

  const filteredModels = models.filter((model) => {
    if (!normalizedSearch) return true;
    return model.name?.toLocaleLowerCase('fa-IR').includes(normalizedSearch);
  });

  return (
    <div className={styles.container} ref={dropdownRef} dir="rtl">
      <button
        type="button"
        className={classNames(styles.selectButton, { [styles.open]: isOpen })}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={value || placeholder}
      >
        <Car size={20} className={styles.carIcon} />
        <span className={classNames(styles.selectText, { [styles.placeholder]: !value })}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={classNames(styles.arrow, { [styles.arrowUp]: isOpen })}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} dir="rtl">
          <div className={styles.dropdownHeader}>
            {selectedMake ? (
              <button type="button" onClick={handleBackToMakes} className={styles.backButton}>
                ← بازگشت به برندها
              </button>
            ) : (
              <span className={styles.title}>انتخاب برند خودرو</span>
            )}
          </div>

          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={selectedMake ? 'جستجوی مدل...' : 'جستجوی برند...'}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoFocus
              dir="rtl"
              autoComplete="off"
            />
          </div>

          <div className={styles.content} role="listbox" aria-busy={loading}>
            {loading ? (
              <div className={styles.stateMessage} role="status" aria-live="polite">
                <Loader2 size={24} className={styles.spinner} aria-hidden="true" />
                <span>در حال دریافت...</span>
              </div>
            ) : error ? (
              <div className={classNames(styles.stateMessage, styles.error)} role="alert">
                <span>{error}</span>
                <button type="button" onClick={handleRetry} className={styles.retryButton}>
                  تلاش مجدد
                </button>
              </div>
            ) : !selectedMake ? (
              <div className={styles.list}>
                {filteredMakes.length === 0 ? (
                  <div className={styles.stateMessage}>برندی یافت نشد</div>
                ) : (
                  filteredMakes.map((make) => (
                    <button
                      key={make.vehicleMakeId}
                      type="button"
                      className={styles.listItem}
                      onClick={() => handleMakeSelect(make)}
                      role="option"
                      aria-selected={selectedMake?.vehicleMakeId === make.vehicleMakeId}
                    >
                      <div className={styles.itemIcon}>
                        {make.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={make.logoUrl} alt="" className={styles.logo} />
                        ) : (
                          <Car size={24} />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{make.name}</span>
                        {make.englishName && <span className={styles.itemSub}>{make.englishName}</span>}
                      </div>
                      {make.country && <span className={styles.badge}>{make.country}</span>}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className={styles.list}>
                {filteredModels.length === 0 ? (
                  <div className={styles.stateMessage}>مدلی یافت نشد</div>
                ) : (
                  filteredModels.map((model) => (
                    <button
                      key={model.vehicleGenerationId || model.name}
                      type="button"
                      className={classNames(styles.listItem, {
                        [styles.selected]: selectedModel?.name === model.name,
                      })}
                      onClick={() => handleModelSelect(model)}
                      role="option"
                      aria-selected={selectedModel?.name === model.name}
                    >
                      <div className={styles.itemIcon}>
                        <Car size={24} />
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{model.name}</span>
                        {model.bodyType && <span className={styles.itemSub}>{model.bodyType}</span>}
                      </div>
                      {selectedModel?.name === model.name && (
                        <span className={styles.checkmark} aria-hidden="true">✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedMake && (
            <div className={styles.selectedMake}>
              <Car size={16} />
              <span>{selectedMake.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
