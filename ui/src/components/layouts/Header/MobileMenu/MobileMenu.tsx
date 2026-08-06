'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Car, Tag, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './MobileMenu.module.scss';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { RootState } from '@/store';

// ایمپورت اکشن‌ها
import { getModelsByMakeId, getAllMakes } from '@/store/feature/vehicle/VehicleThunks';
import { getAllBrands } from '@/store/feature/brand/BrandThunks';
// import { fetchCategories } from '@/store/feature/category/categoryThunks';

// 🟢 تابع استخراج‌گر ایمن (دقیقاً مشابه صفحات دیگر)
const extractSafeArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data; 
  if (Array.isArray(data.items)) return data.items; 
  if (Array.isArray(data.data)) return data.data; 
  if (Array.isArray(data.mainResults)) return data.mainResults; 
  if (data.data && Array.isArray(data.data.items)) return data.data.items; 
  if (data.mainResults && Array.isArray(data.mainResults.items)) return data.mainResults.items;
  return [];
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [activeCategory, setActiveCategory] = useState<any | null>(null);
  const [activeMake, setActiveMake] = useState<any | null>(null);

  // خواندن دیتای خام از ریداکس
  const rawCategories = useAppSelector((state: RootState) => state.category?.categories);
  const rawBrands = useAppSelector((state: RootState) => state.brand?.brands);
  const rawMakes = useAppSelector((state: RootState) => state.vehicle?.makes);
  const rawModels = useAppSelector((state: RootState) => state.vehicle?.models);
  const isVehicleLoading = useAppSelector((state: RootState) => state.vehicle?.loading);
  const brandStatus = useAppSelector(
    (state: RootState) => state.brand?.listStatus ?? 'idle',
  );
  const makesStatus = useAppSelector(
    (state: RootState) => state.vehicle?.makesStatus ?? 'idle',
  );

  // 🟢 استفاده از تابع استخراج ایمن برای جلوگیری از خالی ماندن لیست‌ها
  const categories = useMemo(() => extractSafeArray(rawCategories), [rawCategories]);
  const brands = useMemo(() => extractSafeArray(rawBrands), [rawBrands]);
  const makes = useMemo(() => extractSafeArray(rawMakes), [rawMakes]);
  const models = useMemo(() => extractSafeArray(rawModels), [rawModels]);

  // هر لیست در هر Mount فقط یک تلاش خودکار دارد.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (brandStatus === 'idle') {
      void dispatch(getAllBrands());
    }

    if (makesStatus === 'idle') {
      void dispatch(getAllMakes());
    }
  }, [
    isOpen,
    brandStatus,
    makesStatus,
    dispatch,
  ]);

  // دریافت مدل‌های ماشین به محض کلیک روی یک برند خودرو
  useEffect(() => {
    if (activeMake && activeMake.vehicleMakeId) {
      dispatch(getModelsByMakeId(activeMake.vehicleMakeId));
    }
  }, [activeMake, dispatch]);

  if (!isOpen) return null;

  const mainCategories = categories.filter(cat => !cat.parentCategoryId || cat.parentCategoryId === 0);

  const handleCloseMenu = () => {
    setActiveCategory(null);
    setActiveMake(null);
    onClose();
  };

  const handleNavigation = (path: string) => {
    handleCloseMenu();
    router.push(path);
  };

  return (
    <div className={styles.overlay} onClick={handleCloseMenu}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3>فهرست</h3>
          <button onClick={handleCloseMenu} className={styles.closeBtn} aria-label="بستن منو">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          
          {/* 🟢 ۱. نمای داخلی برای دسته‌بندی‌ها */}
          {activeCategory ? (
            <div className={styles.drillDownView}>
              <button 
                className={styles.backBtn} 
                onClick={() => setActiveCategory(null)}
              >
                <ChevronRight size={20} />
                <span>بازگشت به دسته‌بندی‌ها</span>
              </button>

              <div className={styles.drillDownHeader}>
                <h4 className={styles.activeCatTitle}>{activeCategory.name}</h4>
              </div>

              <div className={styles.subCatList}>
                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                  <>
                    {activeCategory.subCategories.map((sub: any) => (
                      <button
                        key={sub.categoryId}
                        onClick={() => handleNavigation(`/products/${sub.slug || sub.categoryId}`)}
                        className={styles.mainCategoryItem} 
                      >
                        <span>{sub.name}</span>
                        <ChevronLeft size={18} className={styles.arrowIcon} />
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => handleNavigation(`/products/${activeCategory.slug || activeCategory.categoryId}`)}
                      className={styles.viewAllBottomBtn}
                    >
                      <span>مشاهده همه محصولات این دسته</span>
                      <ChevronLeft size={16} />
                    </button>
                  </>
                ) : (
                  <p className={styles.noSubMsg}>زیردسته‌ای برای این مورد ثبت نشده است.</p>
                )}
              </div>
            </div>
          ) : 
          
          /* 🟢 ۲. نمای داخلی برای مدل‌های ماشین */
          activeMake ? (
            <div className={styles.drillDownView}>
              <button 
                className={styles.backBtn} 
                onClick={() => setActiveMake(null)}
              >
                <ChevronRight size={20} />
                <span>بازگشت به ماشین‌ها</span>
              </button>

              <div className={styles.drillDownHeader}>
                <h4 className={styles.activeCatTitle}>{activeMake.name}</h4>
              </div>

              <div className={styles.subCatList}>
                {isVehicleLoading ? (
                  <p className={styles.noSubMsg}>در حال دریافت مدل‌ها...</p>
                ) : models && models.length > 0 ? (
                  <>
                    {models.map((model: any) => (
                      <button
                        key={model.vehicleModelId} // 🟢 کلید یکتا اصلاح شد
                        onClick={() => handleNavigation(`/vehicles/${activeMake.name}/${model.name}`)}
                        className={styles.mainCategoryItem} 
                      >
                        <span>{model.name}</span>
                        <ChevronLeft size={18} className={styles.arrowIcon} />
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => handleNavigation(`/vehicles/${activeMake.name}`)}
                      className={styles.viewAllBottomBtn}
                    >
                      <span>مشاهده همه مدل‌های {activeMake.name}</span>
                      <ChevronLeft size={16} />
                    </button>
                  </>
                ) : (
                  <p className={styles.noSubMsg}>مدلی برای این ماشین ثبت نشده است.</p>
                )}
              </div>
            </div>
          ) : 
          
          /* 🟢 ۳. نمای اصلی منو */
          (
            <>
              {/* بخش دسته‌بندی کالاها */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <LayoutGrid size={20} />
                  <span>دسته‌بندی کالاها</span>
                </div>
                <div className={styles.sectionContent}>
                  {mainCategories.map((cat) => (
                    <button 
                      key={cat.categoryId} 
                      className={styles.mainCategoryItem}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <span>{cat.name}</span>
                      <ChevronLeft size={18} className={styles.arrowIcon} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              {/* بخش ماشین‌ها */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Car size={20} />
                  <span>ماشین‌ها</span>
                </div>
                <div className={styles.sectionContent}>
                  {makes.slice(0, 10).map((make) => (
                    <button
                      key={make.vehicleMakeId} // 🟢 مشکل ارور Key دقیقاً در اینجا بود که اصلاح شد
                      onClick={() => setActiveMake(make)}
                      className={styles.mainCategoryItem} 
                    >
                      <span>{make.name}</span>
                      <ChevronLeft size={18} className={styles.arrowIcon} />
                    </button>
                  ))}
                  {makes.length > 10 && (
                    <button
                      onClick={() => handleNavigation('/vehicles')}
                      className={styles.viewAll}
                    >
                      مشاهده همه ماشین‌ها <ChevronLeft size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.divider} />

              {/* بخش برندها */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Tag size={20} />
                  <span>برندها</span>
                </div>
                <div className={styles.sectionContent}>
                  {brands.slice(0, 10).map((brand) => (
                    <button
                      key={brand.brandId}
                      onClick={() => handleNavigation(`/brands/${brand.brandId}`)}
                      className={styles.simpleLink}
                    >
                      {brand.name}
                    </button>
                  ))}
                  {brands.length > 10 && (
                    <button
                      onClick={() => handleNavigation('/brands')}
                      className={styles.viewAll}
                    >
                      مشاهده همه برندها <ChevronLeft size={14} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
