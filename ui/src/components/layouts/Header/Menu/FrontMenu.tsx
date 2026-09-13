'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  FloatingPortal,
  autoUpdate,
  offset,
  safePolygon,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

import {
  BookOpen,
  Car,
  CircleHelp,
  LayoutGrid,
  Tag,
  Stethoscope,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import DropdownMenu from './DropdownMenu';
import styles from './FrontMenu.module.scss';

import type {
  RootState,
} from '@/store';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import {
  fetchCategories,
} from '@/store/feature/Category/categoryThunks';

import {
  getAllBrands,
} from '@/store/feature/brand/BrandThunks';

import {
  getAllMakes,
} from '@/store/feature/vehicle/VehicleThunks';
import { resetCategoryFetch } from '@/store/feature/Category/categorySlice';
import { resetBrandsRequest } from '@/store/feature/brand/BrandSlice';
import { resetVehicleMakesRequest } from '@/store/feature/vehicle/VehicleSlice';

const FrontMenu = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const categories = useAppSelector(
    (state: RootState) =>
      state.category.categories,
  );

  const categoryStatus = useAppSelector(
    (state: RootState) =>
      state.category.fetchStatus ??
      'idle',
  );

  const brandStatus = useAppSelector(
    (state: RootState) =>
      state.brand.listStatus ??
      'idle',
  );

  const vehicleStatus = useAppSelector(
    (state: RootState) =>
      state.vehicle.makesStatus ??
      'idle',
  );
  const categoryError = useAppSelector((state: RootState) => state.category.error);
  const brandError = useAppSelector((state: RootState) => state.brand.error);
  const vehicleError = useAppSelector((state: RootState) => state.vehicle.error);

  const [
    openCategory,
    setOpenCategory,
  ] = useState(false);

  const retryMenuData = () => {
    if (categoryStatus === 'failed') { dispatch(resetCategoryFetch()); void dispatch(fetchCategories()); }
    if (brandStatus === 'failed') { dispatch(resetBrandsRequest()); void dispatch(getAllBrands()); }
    if (vehicleStatus === 'failed') { dispatch(resetVehicleMakesRequest()); void dispatch(getAllMakes()); }
  };

  /*
   * هر منبع فقط وقتی status=idle است یک بار درخواست می‌شود.
   * بعد از شکست، status=failed باقی می‌ماند و Effect دیگر Retry نمی‌کند.
   */
  useEffect(() => {
    if (categoryStatus === 'idle') {
      void dispatch(fetchCategories());
    }

    if (brandStatus === 'idle') {
      void dispatch(getAllBrands());
    }

    if (vehicleStatus === 'idle') {
      void dispatch(getAllMakes());
    }
  }, [
    dispatch,
    categoryStatus,
    brandStatus,
    vehicleStatus,
  ]);

  const category = useFloating({
    open: openCategory,
    onOpenChange: setOpenCategory,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(12),
    ],
  });

  const categoryInteractions =
    useInteractions([
      useHover(
        category.context,
        {
          handleClose: safePolygon(),
          delay: {
            open: 80,
            close: 120,
          },
        },
      ),

      useDismiss(category.context),

      useRole(
        category.context,
        {
          role: 'menu',
        },
      ),
    ]);

  return (
    <>
      <div className={styles.container}>
        <div
          ref={category.refs.setReference}
          className={`${styles.trigger} ${styles.categoryTrigger}`}
          {...categoryInteractions.getReferenceProps()}
        >
          <LayoutGrid size={20} />

          <span className={styles.triggerText}>
            دسته‌بندی محصولات
          </span>
        </div>

        <div
          className={styles.trigger}
          style={{ cursor: 'pointer' }}
          onClick={() =>
            router.push('/vehicles')
          }
        >
          <Car size={18} />

          <span className={styles.triggerText}>
            ماشین‌ها
          </span>
        </div>

        <div
          className={styles.trigger}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/brands')}
        >
          <Tag size={18} />
          <span className={styles.triggerText}>برندها</span>
        </div>

        <div
          className={styles.trigger}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/diagnose')}
        >
          <Stethoscope size={18} />
          <span className={styles.triggerText}>تشخیص</span>
        </div>

        <div
          className={styles.trigger}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/blog')}
        >
          <BookOpen size={18} />
          <span className={styles.triggerText}>مقالات</span>
        </div>

        <div
          className={styles.trigger}
          style={{
            cursor: 'pointer',
          }}
          onClick={() =>
            router.push('/faq')
          }
        >
          <CircleHelp size={18} />

          <span className={styles.triggerText}>
            سوالات متداول
          </span>
        </div>
      </div>

      {openCategory && (
        <div
          className={styles.overlay}
          onMouseEnter={() =>
            setOpenCategory(false)
          }
        />
      )}

      {openCategory && (
        <FloatingPortal>
          <div
            ref={category.refs.setFloating}
            className={styles.megaMenu}
            {...categoryInteractions.getFloatingProps()}
          >
          <DropdownMenu
            categories={categories}
            isLoading={categoryStatus === 'loading'}
            error={categoryError}
            onRetry={retryMenuData}
          />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default FrontMenu;
