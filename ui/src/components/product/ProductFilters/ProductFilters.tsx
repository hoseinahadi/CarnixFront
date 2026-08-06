'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { IconX } from '@tabler/icons-react';

import { fetchCategories } from '@/store/feature/Category/categoryThunks';
import { getAllTrimDetails } from '@/store/feature/vehicle/VehicleThunks';

import {
  selectActiveFilters,
} from '@/store/feature/product/productFilterSelectors';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import type {
  ProductFilterParams,
  VehicleFilterOption,
} from '@/models/product/ProductFilters';

import ActiveFilterTags from './ActiveFilterTags/ActiveFilterTags';
import FilterSection from './FilterSection/FilterSection';
import PriceRangeSlider from './PriceRangeSlider/PriceRangeSlider';

import styles from './ProductFilters.module.scss';

interface ProductFiltersProps {
  onFiltersChange: (
    patch: Partial<ProductFilterParams>,
  ) => void;
  onClearAll: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  priceRange?: {
    minPrice: number;
    maxPrice: number;
  };
}

const ProductFilters = ({
  onFiltersChange,
  onClearAll,
  onClose,
  isMobile = false,
  priceRange,
}: ProductFiltersProps) => {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector(
    selectActiveFilters,
  );

  const categories = useAppSelector(
    (state) => state.category.categories,
  );

  const categoryLoading = useAppSelector(
    (state) => state.category.loading,
  );

  const categoryError = useAppSelector(
    (state) => state.category.error,
  );

  const vehicles = useAppSelector(
    (state) => state.vehicle.trimDetails,
  );

  const vehicleStatus = useAppSelector(
    (state) => state.vehicle.trimDetailsStatus,
  );

  const vehicleError = useAppSelector(
    (state) => state.vehicle.error,
  );

  const [categorySearch, setCategorySearch] =
    useState('');

  const [expandedSections, setExpandedSections] =
    useState<Record<string, boolean>>({
      category: true,
      price: true,
      vehicle: true,
    });

  useEffect(() => {
    if (
      categories.length === 0 &&
      !categoryLoading &&
      !categoryError
    ) {
      void dispatch(fetchCategories());
    }
  }, [
    dispatch,
    categories.length,
    categoryLoading,
    categoryError,
  ]);

  useEffect(() => {
    if (vehicleStatus === 'idle') {
      void dispatch(getAllTrimDetails());
    }
  }, [dispatch, vehicleStatus]);

  const filteredCategories = useMemo(() => {
    const searchTerm = categorySearch.trim();

    return categories.filter((category) => {
      const isRootCategory =
        !category.parentCategoryId ||
        category.parentCategoryId === 0;

      if (!isRootCategory) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      return category.name
        ?.toLocaleLowerCase('fa-IR')
        .includes(
          searchTerm.toLocaleLowerCase('fa-IR'),
        );
    });
  }, [categories, categorySearch]);

  const toggleSection = (key: string) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleCategoryChange = (
    categoryId: number,
  ) => {
    const isSelected =
      Number(activeFilters.categoryId) ===
      Number(categoryId);

    onFiltersChange({
      categoryId: isSelected
        ? undefined
        : categoryId,
      brandId: undefined,
    });
  };

  const handleVehicleChange = (
    vehicle: VehicleFilterOption,
  ) => {
    const isSelected =
      activeFilters.makeId === vehicle.makeId &&
      activeFilters.modelId === vehicle.modelId;

    onFiltersChange({
      makeId: isSelected
        ? undefined
        : vehicle.makeId,
      modelId: isSelected
        ? undefined
        : vehicle.modelId,
      trimId: undefined,
      vehicleIds: isSelected
        ? undefined
        : [
            {
              makeId: vehicle.makeId,
              modelId: vehicle.modelId,
            },
          ],
    });
  };

  const baseMinPrice = priceRange?.minPrice ?? 0;
  const baseMaxPrice =
    priceRange?.maxPrice ?? 100_000_000;

  const handlePriceChange = (
    minPrice: number,
    maxPrice: number,
  ) => {
    const isDefaultRange =
      minPrice <= baseMinPrice &&
      maxPrice >= baseMaxPrice;

    onFiltersChange({
      minPrice: isDefaultRange
        ? undefined
        : minPrice,
      maxPrice: isDefaultRange
        ? undefined
        : maxPrice,
    });
  };

  const handleStockToggle = () => {
    onFiltersChange({
      inStock: activeFilters.inStock
        ? undefined
        : true,
    });
  };

  const handleRemoveFilter = (key: string) => {
    switch (key) {
      case 'price':
        onFiltersChange({
          minPrice: undefined,
          maxPrice: undefined,
        });
        break;

      case 'vehicle':
        onFiltersChange({
          makeId: undefined,
          modelId: undefined,
          trimId: undefined,
          vehicleIds: undefined,
        });
        break;

      case 'categoryId':
        onFiltersChange({
          categoryId: undefined,
          brandId: undefined,
        });
        break;

      case 'brandId':
        onFiltersChange({
          brandId: undefined,
        });
        break;

      case 'inStock':
        onFiltersChange({
          inStock: undefined,
        });
        break;

      case 'hasDiscount':
        onFiltersChange({
          hasDiscount: undefined,
        });
        break;

      default:
        break;
    }
  };

  const hasActiveFilters = Boolean(
    activeFilters.categoryId ||
      activeFilters.brandId ||
      activeFilters.makeId ||
      activeFilters.modelId ||
      activeFilters.inStock ||
      activeFilters.hasDiscount ||
      activeFilters.minPrice !== undefined ||
      activeFilters.maxPrice !== undefined,
  );

  return (
    <div
      className={`${styles.filters} ${
        isMobile ? styles.mobile : ''
      }`}
    >
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          فیلترها
        </span>

        <div className={styles.headerActions}>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className={styles.clearAllBtn}
            >
              حذف فیلترها
            </button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              aria-label="بستن فیلترها"
            >
              <IconX size={20} />
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <ActiveFilterTags
          filters={activeFilters}
          categories={categories}
          vehicles={vehicles}
          onRemove={handleRemoveFilter}
        />
      )}

      <FilterSection
        title="دسته‌بندی‌ها"
        expanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
        searchValue={categorySearch}
        onSearchChange={setCategorySearch}
        showSearch
      >
        <div className={styles.optionsList}>
          {categoryError &&
          filteredCategories.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: '#b42318',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              دریافت دسته‌بندی‌ها ناموفق بود.
            </div>
          ) : categoryLoading &&
            filteredCategories.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: '#777',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              در حال دریافت دسته‌بندی‌ها...
            </div>
          ) : (
            filteredCategories.map((category) => (
              <label
                key={category.categoryId}
                className={styles.checkboxLabel}
              >
                <input
                  type="checkbox"
                  checked={
                    Number(activeFilters.categoryId) ===
                    Number(category.categoryId)
                  }
                  onChange={() =>
                    handleCategoryChange(
                      category.categoryId,
                    )
                  }
                />

                <span className={styles.checkmark} />
                <span>{category.name}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>

      <FilterSection
        title="بازه قیمت (تومان)"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <PriceRangeSlider
          min={baseMinPrice}
          max={baseMaxPrice}
          currentMin={
            activeFilters.minPrice ?? baseMinPrice
          }
          currentMax={
            activeFilters.maxPrice ?? baseMaxPrice
          }
          onChange={handlePriceChange}
        />
      </FilterSection>

      <FilterSection
        title={`ماشین (${vehicles.length})`}
        expanded={expandedSections.vehicle}
        onToggle={() => toggleSection('vehicle')}
      >
        <div className={styles.optionsList}>
          {vehicleStatus === 'failed' &&
          vehicles.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: '#b42318',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              {vehicleError || 'دریافت خودروها ناموفق بود.'}
            </div>
          ) : vehicleStatus === 'loading' &&
            vehicles.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: '#777',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              در حال دریافت خودروها...
            </div>
          ) : vehicles.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: '#999',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              خودرویی برای نمایش وجود ندارد.
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const isSelected =
                activeFilters.makeId === vehicle.makeId &&
                activeFilters.modelId === vehicle.modelId;

              return (
                <label
                  key={vehicle.id}
                  className={styles.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      handleVehicleChange(vehicle)
                    }
                  />

                  <span className={styles.checkmark} />
                  <span>{vehicle.name}</span>
                </label>
              );
            })
          )}
        </div>
      </FilterSection>

      <div className={styles.stockSection}>
        <div className={styles.stockToggle}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={Boolean(activeFilters.inStock)}
              onChange={handleStockToggle}
            />
            <span className={styles.sliderRound} />
          </label>

          <span className={styles.stockLabel}>
            فقط موارد موجود
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
