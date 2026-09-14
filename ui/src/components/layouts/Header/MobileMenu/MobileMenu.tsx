'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Car,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Stethoscope,
  Tag,
  X,
} from 'lucide-react';
import styles from './MobileMenu.module.scss';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';
import { fetchCategories, fetchSubCategories } from '@/store/feature/Category/categoryThunks';
import { getAllMakes, getModelsByMakeId } from '@/store/feature/vehicle/VehicleThunks';
import { resolveVehicleMakeId, resolveVehicleModelId } from '@/utils/vehicleIds';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const extractSafeArray = (data: unknown): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];

  const value = data as Record<string, any>;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.mainResults)) return value.mainResults;
  if (value.data && Array.isArray(value.data.items)) return value.data.items;
  if (value.mainResults && Array.isArray(value.mainResults.items)) return value.mainResults.items;
  return [];
};

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fetchedCategoryIds = useRef(new Set<number>());

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeMake, setActiveMake] = useState<any | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [makesOpen, setMakesOpen] = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  useBodyScrollLock(isOpen);

  const rawCategories = useAppSelector((state: RootState) => state.category?.categories);
  const categoryStatus = useAppSelector((state: RootState) => state.category?.fetchStatus ?? 'idle');
  const rawMakes = useAppSelector((state: RootState) => state.vehicle?.makes);
  const rawModels = useAppSelector((state: RootState) => state.vehicle?.models);
  const isVehicleLoading = useAppSelector((state: RootState) => state.vehicle?.loading);
  const makesStatus = useAppSelector((state: RootState) => state.vehicle?.makesStatus ?? 'idle');

  const categories = useMemo(() => extractSafeArray(rawCategories), [rawCategories]);
  const makes = useMemo(() => extractSafeArray(rawMakes), [rawMakes]);
  const models = useMemo(() => extractSafeArray(rawModels), [rawModels]);
  const mainCategories = useMemo(
    () => categories.filter((category) => !category.parentCategoryId || category.parentCategoryId === 0),
    [categories],
  );
  const activeCategory = useMemo(
    () => mainCategories.find((category) => Number(category.categoryId) === activeCategoryId) ?? null,
    [activeCategoryId, mainCategories],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (categoryStatus === 'idle') void dispatch(fetchCategories());
    if (makesStatus === 'idle') void dispatch(getAllMakes());
  }, [categoryStatus, dispatch, isOpen, makesStatus]);

  useEffect(() => {
    const categoryId = Number(activeCategory?.categoryId);
    if (!categoryId || fetchedCategoryIds.current.has(categoryId)) return;
    if (activeCategory.subCategories?.length) return;

    fetchedCategoryIds.current.add(categoryId);
    setSubCategoryLoading(true);
    void dispatch(fetchSubCategories(categoryId))
      .unwrap()
      .catch(() => undefined)
      .finally(() => setSubCategoryLoading(false));
  }, [activeCategory, dispatch]);

  useEffect(() => {
    const makeId = resolveVehicleMakeId(activeMake);
    if (makeId) void dispatch(getModelsByMakeId(makeId));
  }, [activeMake, dispatch]);

  if (!isOpen) return null;

  const handleCloseMenu = () => {
    setActiveCategoryId(null);
    setActiveMake(null);
    onClose();
  };

  const handleNavigation = (path: string) => {
    handleCloseMenu();
    router.push(path);
  };

  return (
    <div className={styles.overlay} onClick={handleCloseMenu}>
      <div className={styles.menu} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3>فهرست</h3>
          <button onClick={handleCloseMenu} className={styles.closeBtn} aria-label="بستن منو">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {activeCategory ? (
            <div className={styles.drillDownView}>
              <button className={styles.backBtn} onClick={() => setActiveCategoryId(null)}>
                <ChevronRight size={20} />
                <span>بازگشت به دسته‌بندی‌ها</span>
              </button>
              <div className={styles.drillDownHeader}>
                <h4 className={styles.activeCatTitle}>{activeCategory.name}</h4>
              </div>
              <div className={styles.subCatList}>
                {subCategoryLoading ? (
                  <p className={styles.noSubMsg}>در حال دریافت زیردسته‌ها...</p>
                ) : activeCategory.subCategories?.length ? (
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
          ) : activeMake ? (
            <div className={styles.drillDownView}>
              <button className={styles.backBtn} onClick={() => setActiveMake(null)}>
                <ChevronRight size={20} />
                <span>بازگشت به ماشین‌ها</span>
              </button>
              <div className={styles.drillDownHeader}>
                <h4 className={styles.activeCatTitle}>{activeMake.name}</h4>
              </div>
              <div className={styles.subCatList}>
                {isVehicleLoading ? (
                  <p className={styles.noSubMsg}>در حال دریافت مدل‌ها...</p>
                ) : models.length ? (
                  <>
                    {models.map((model: any) => {
                      const makeId = resolveVehicleMakeId(activeMake);
                      const modelId = resolveVehicleModelId(model);
                      if (!makeId || !modelId) return null;
                      return (
                        <button
                          key={modelId}
                          onClick={() => handleNavigation(`/products?makeId=${makeId}&modelId=${modelId}`)}
                          className={styles.mainCategoryItem}
                        >
                          <span>{model.name}</span>
                          <ChevronLeft size={18} className={styles.arrowIcon} />
                        </button>
                      );
                    })}
                    <button onClick={() => handleNavigation('/vehicles')} className={styles.viewAllBottomBtn}>
                      <span>مشاهده همه مدل‌های {activeMake.name}</span>
                      <ChevronLeft size={16} />
                    </button>
                  </>
                ) : (
                  <p className={styles.noSubMsg}>مدلی برای این ماشین ثبت نشده است.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() => setCategoriesOpen((current) => !current)}
                  aria-expanded={categoriesOpen}
                >
                  <LayoutGrid size={20} />
                  <span>دسته‌بندی محصولات</span>
                  <ChevronLeft size={18} className={`${styles.arrowIcon} ${categoriesOpen ? styles.openArrow : ''}`} />
                </button>
                {categoriesOpen && (
                  <div className={styles.sectionContent}>
                    {mainCategories.map((category) => (
                      <button
                        key={category.categoryId}
                        className={styles.mainCategoryItem}
                        onClick={() => setActiveCategoryId(Number(category.categoryId))}
                      >
                        <span>{category.name}</span>
                        <ChevronLeft size={18} className={styles.arrowIcon} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.divider} />

              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionHeader}
                  onClick={() => setMakesOpen((current) => !current)}
                  aria-expanded={makesOpen}
                >
                  <Car size={20} />
                  <span>ماشین‌ها</span>
                  <ChevronLeft size={18} className={`${styles.arrowIcon} ${makesOpen ? styles.openArrow : ''}`} />
                </button>
                {makesOpen && (
                  <div className={styles.sectionContent}>
                    {makes.slice(0, 10).map((make) => (
                      <button
                        key={make.vehicleMakeId}
                        onClick={() => setActiveMake(make)}
                        className={styles.mainCategoryItem}
                      >
                        <span>{make.name}</span>
                        <ChevronLeft size={18} className={styles.arrowIcon} />
                      </button>
                    ))}
                    {makes.length > 10 && (
                      <button onClick={() => handleNavigation('/vehicles')} className={styles.viewAll}>
                        مشاهده همه ماشین‌ها <ChevronLeft size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.divider} />
              <div className={styles.section}>
                <button className={styles.menuLink} onClick={() => handleNavigation('/brands')}>
                  <Tag size={20} />
                  <span>برندها</span>
                  <ChevronLeft size={18} className={styles.arrowIcon} />
                </button>
                <button className={styles.menuLink} onClick={() => handleNavigation('/diagnose')}>
                  <Stethoscope size={20} />
                  <span>تشخیص</span>
                  <ChevronLeft size={18} className={styles.arrowIcon} />
                </button>
                <button className={styles.menuLink} onClick={() => handleNavigation('/blog')}>
                  <BookOpen size={20} />
                  <span>مقالات</span>
                  <ChevronLeft size={18} className={styles.arrowIcon} />
                </button>
                <button className={styles.menuLink} onClick={() => handleNavigation('/faq')}>
                  <CircleHelp size={20} />
                  <span>سوالات متداول</span>
                  <ChevronLeft size={18} className={styles.arrowIcon} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
