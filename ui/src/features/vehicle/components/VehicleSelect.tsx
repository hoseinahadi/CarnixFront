// src/components/common/VehicleSelect/VehicleSelect.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VehicleApi } from '../api/VehicleApi';
import type { VehicleMake, VehicleModel } from '@/models/Vehicle/Vehicle';
import { Car, ChevronDown, Search, Loader2 } from 'lucide-react';
import styles from './VehicleSelect.module.scss';
import classNames from 'classnames';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function VehicleSelect({ value, onChange, placeholder = 'انتخاب خودرو', disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // بستن دراپ‌دان با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // لود برندها در اولین باز شدن
  useEffect(() => {
    if (isOpen && makes.length === 0) {
      loadMakes();
    }
  }, [isOpen]);

  // لود مدل‌ها با انتخاب برند
  useEffect(() => {
    if (selectedMake) {
      loadModels(selectedMake.vehicleMakeId);
    }
  }, [selectedMake]);

  const loadMakes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await VehicleApi.getAllMakes();
      if (response.data?.data) {
        setMakes(response.data.data);
      }
    } catch (err) {
      setError('خطا در دریافت برندها');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (makeId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await VehicleApi.getModelsByMakeId(makeId);
      if (response.data?.data) {
        setModels(response.data.data);
      }
    } catch (err) {
      setError('خطا در دریافت مدل‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeSelect = (make: VehicleMake) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSearchTerm('');
  };

  const handleModelSelect = (model: VehicleModel) => {
    setSelectedModel(model);
    const displayValue = `${selectedMake?.name} - ${model.name}`;
    onChange(displayValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleBackToMakes = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setModels([]);
    setSearchTerm('');
  };

  const filteredMakes = makes.filter(make => 
    make.name.includes(searchTerm) || 
    make.englishName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = models.filter(model => 
    model.name.includes(searchTerm)
  );

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* دکمه انتخاب */}
      <button
        type="button"
        className={classNames(styles.selectButton, { [styles.open]: isOpen })}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
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

      {/* منوی دراپ‌دان */}
      {isOpen && (
        <div className={styles.dropdown}>
          {/* هدر */}
          <div className={styles.dropdownHeader}>
            {selectedMake ? (
              <button type="button" onClick={handleBackToMakes} className={styles.backButton}>
                ← بازگشت به برندها
              </button>
            ) : (
              <span className={styles.title}>
                {selectedMake ? `مدل‌های ${(selectedMake as VehicleMake).name}` : 'انتخاب برند خودرو'}
              </span>
            )}
          </div>

          {/* جستجو */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={selectedMake ? 'جستجوی مدل...' : 'جستجوی برند...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* محتوا */}
          <div className={styles.content}>
            {loading ? (
              <div className={styles.stateMessage}>
                <Loader2 size={24} className={styles.spinner} />
                <span>در حال دریافت...</span>
              </div>
            ) : error ? (
              <div className={classNames(styles.stateMessage, styles.error)}>
                {error}
                <button type="button" onClick={loadMakes} className={styles.retryButton}>
                  تلاش مجدد
                </button>
              </div>
            ) : !selectedMake ? (
              /* لیست برندها */
              <div className={styles.list}>
                {filteredMakes.length === 0 ? (
                  <div className={styles.stateMessage}>برندی یافت نشد</div>
                ) : (
                  filteredMakes.map(make => (
                    <button
                      key={make.vehicleMakeId}
                      type="button"
                      className={styles.listItem}
                      onClick={() => handleMakeSelect(make)}
                    >
                      <div className={styles.itemIcon}>
                        {make.logoUrl ? (
                          <img src={make.logoUrl} alt={make.name} className={styles.logo} />
                        ) : (
                          <Car size={24} />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{make.name}</span>
                        {make.englishName && (
                          <span className={styles.itemSub}>{make.englishName}</span>
                        )}
                      </div>
                      <span className={styles.badge}>{make.country}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* لیست مدل‌ها */
              <div className={styles.list}>
                {filteredModels.length === 0 ? (
                  <div className={styles.stateMessage}>مدلی یافت نشد</div>
                ) : (
                  filteredModels.map(model => (
                    <button
                      key={model.vehicleGenerationId || model.name}
                      type="button"
                      className={classNames(styles.listItem, {
                        [styles.selected]: selectedModel?.name === model.name
                      })}
                      onClick={() => handleModelSelect(model)}
                    >
                      <div className={styles.itemIcon}>
                        <Car size={24} />
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{model.name}</span>
                        <span className={styles.itemSub}>{model.bodyType}</span>
                      </div>
                      {selectedModel?.name === model.name && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* برند انتخاب شده */}
          {selectedMake && (
            <div className={styles.selectedMake}>
              <Car size={14} />
              <span>{selectedMake.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}