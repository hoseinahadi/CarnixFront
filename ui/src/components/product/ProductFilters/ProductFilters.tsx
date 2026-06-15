// src/components/product/ProductFilters/ProductFilters.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilters, clearFilters, fetchFilteredProducts } from '@/store/feature/product/productFilterSlice'
import { selectActiveFilters } from '@/store/feature/product/productFilterSelectors'
import { CategoryApi } from '@/features/category/api/routes'
import { Category } from '@/models/category/Category'
import styles from './ProductFilters.module.scss'
import { IconX } from '@tabler/icons-react'
import ActiveFilterTags from './ActiveFilterTags/ActiveFilterTags'
import FilterSection from './FilterSection/FilterSection'
import PriceRangeSlider from './PriceRangeSlider/PriceRangeSlider'

interface ProductFiltersProps {
  onClose?: () => void
  isMobile?: boolean
  priceRange?: { minPrice: number; maxPrice: number }
  onClearAll?: () => void
}

const ProductFilters = ({ onClose, isMobile, priceRange, onClearAll }: ProductFiltersProps) => {
  const dispatch = useAppDispatch()
  const activeFilters = useAppSelector(selectActiveFilters)

  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    vehicle: true,
  })

  // دریافت دسته‌بندی‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await CategoryApi.getAll()
        if (catRes.data?.isSuccess) setCategories(catRes.data.data)
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    fetchData()
  }, [])

  // دریافت خودروها با اطلاعات کامل
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const { VehicleApi } = await import('@/features/vehicle/api/VehicleApi')
        const vehiclesRes = await VehicleApi.getAllTrimsWithDetails()
        
        if (vehiclesRes.data?.isSuccess && Array.isArray(vehiclesRes.data.data)) {
          setVehicles(vehiclesRes.data.data)
        } else if (Array.isArray(vehiclesRes.data)) {
          setVehicles(vehiclesRes.data)
        }
      } catch (err) {
        console.error('Failed to load vehicles', err)
      }
    }
    fetchVehicleData()
  }, [])

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories.filter(c => !c.parentCategoryId)
    return categories.filter(c => !c.parentCategoryId && c.name.includes(categorySearch.trim()))
  }, [categories, categorySearch])

  // هندلر تغییر دسته‌بندی
  const handleCategoryChange = (categoryId: number) => {
    const newFilters = { 
      ...activeFilters, 
      categoryId: activeFilters.categoryId === categoryId ? undefined : categoryId 
    }
    dispatch(setFilters(newFilters))
    dispatch(fetchFilteredProducts(newFilters))
  }

 // ✅ هندلر تغییر خودرو (چندتایی)
const handleVehicleChange = (vehicle: any) => {
  // آرایه vehicleIds را از فیلترهای فعال می‌گیریم
  const currentVehicleIds = activeFilters.vehicleIds || []
  
  // بررسی می‌کنیم آیا این خودرو قبلاً انتخاب شده است
  const isSelected = currentVehicleIds.some(
    id => id.makeId === vehicle.vehicleMakeId && id.modelId === vehicle.vehicleModelId
  )
  
  let newVehicleIds
  if (isSelected) {
    // اگر قبلاً انتخاب شده، حذفش می‌کنیم
    newVehicleIds = currentVehicleIds.filter(
      id => !(id.makeId === vehicle.vehicleMakeId && id.modelId === vehicle.vehicleModelId)
    )
  } else {
    // اگر انتخاب نشده، اضافهش می‌کنیم
    newVehicleIds = [
      ...currentVehicleIds,
      { makeId: vehicle.vehicleMakeId, modelId: vehicle.vehicleModelId }
    ]
  }
  
  const newFilters = { 
    ...activeFilters, 
    vehicleIds: newVehicleIds.length > 0 ? newVehicleIds : undefined,
    // حذف makeId و modelId تکی تا تداخل نداشته باشد
    makeId: undefined,
    modelId: undefined
  }
  
  dispatch(setFilters(newFilters))
  dispatch(fetchFilteredProducts(newFilters))
}

  // هندلر تغییر قیمت
  const handlePriceChange = (min: number, max: number) => {
    const newFilters = { ...activeFilters, minPrice: min, maxPrice: max }
    dispatch(setFilters(newFilters))
    dispatch(fetchFilteredProducts(newFilters))
  }

  // هندلر تغییر موجودی (فقط موارد موجود)
  const handleStockToggle = () => {
    const newFilters = { ...activeFilters, inStock: !activeFilters.inStock }
    dispatch(setFilters(newFilters))
    dispatch(fetchFilteredProducts(newFilters))
  }

  // هندلر پاک کردن همه فیلترها
  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
    } else {
      dispatch(clearFilters())
      const emptyFilters = {
        categoryId: undefined,
        vehicleIds: undefined,
        inStock: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: activeFilters.sortBy,
        page: 1
      }
      dispatch(fetchFilteredProducts(emptyFilters))
    }
  }

  // هندلر حذف یک فیلتر خاص
  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete (newFilters as any)[key]
    dispatch(setFilters(newFilters))
    dispatch(fetchFilteredProducts(newFilters))
  }

  const hasActiveFilters = !!(activeFilters.categoryId || 
    (activeFilters.vehicleIds && activeFilters.vehicleIds.length > 0) ||
    activeFilters.inStock || activeFilters.minPrice || activeFilters.maxPrice)

  return (
    <div className={`${styles.filters} ${isMobile ? styles.mobile : ''}`}>
      {/* هدر */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>فیلترها</span>
        <div className={styles.headerActions}>
          {hasActiveFilters && (
            <button onClick={handleClearAll} className={styles.clearAllBtn}>
              حذف فیلترها
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} className={styles.closeBtn}>
              <IconX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* تگ‌های فیلتر فعال */}
      {hasActiveFilters && (
        <ActiveFilterTags
          filters={activeFilters}
          categories={categories}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll} brands={[]}        />
      )}

      {/* دسته‌بندی */}
      <FilterSection
        title="دسته‌بندی ها"
        expanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
        searchValue={categorySearch}
        onSearchChange={setCategorySearch}
        showSearch
      >
        <div className={styles.optionsList}>
          {filteredCategories.map(cat => (
            <label key={cat.categoryId} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={activeFilters.categoryId === cat.categoryId}
                onChange={() => handleCategoryChange(cat.categoryId)}
              />
              <span className={styles.checkmark}></span>
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* بازه قیمت */}
      <FilterSection
        title="بازه قیمت (تومان)"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <PriceRangeSlider
          min={priceRange?.minPrice || 0}
          max={priceRange?.maxPrice || 10000000}
          currentMin={activeFilters.minPrice || priceRange?.minPrice || 0}
          currentMax={activeFilters.maxPrice || priceRange?.maxPrice || 10000000}
          onChange={handlePriceChange}
        />
      </FilterSection>

      {/* ماشین */}
      <FilterSection
        title={`ماشین (${vehicles.length})`}
        expanded={expandedSections.vehicle}
        onToggle={() => toggleSection('vehicle')}
      >
        <div className={styles.optionsList}>
          {vehicles.length === 0 ? (
            <div style={{ padding: '10px', color: '#999', fontSize: '13px', textAlign: 'center' }}>
              در حال بارگذاری...
            </div>
          ) : (
            vehicles.map(vehicle => {
              // بررسی می‌کنیم آیا این خودرو در آرایه vehicleIds انتخاب شده است
              const isSelected = (activeFilters.vehicleIds || []).some(
                id => id.makeId === vehicle.vehicleMakeId && id.modelId === vehicle.vehicleModelId
              )
              
              return (
                <label key={vehicle.vehicleTrimId} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleVehicleChange(vehicle)}
                  />
                  <span className={styles.checkmark}></span>
                  <span>{vehicle.name}</span>
                </label>
              )
            })
          )}
        </div>
      </FilterSection>

      {/* فقط موارد موجود */}
      <div className={styles.stockSection}>
        <div className={styles.stockToggle}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={!!activeFilters.inStock}
              onChange={handleStockToggle}
            />
            <span className={styles.sliderRound}></span>
          </label>
          <span className={styles.stockLabel}>فقط موارد موجود</span>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters