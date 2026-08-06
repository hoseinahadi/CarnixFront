
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
  Car,
  LayoutGrid,
  Tag,
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

  const [
    openCategory,
    setOpenCategory,
  ] = useState(false);

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
          className={styles.trigger}
          style={{
            paddingLeft: '5rem',
          }}
          {...categoryInteractions.getReferenceProps()}
        >
          <LayoutGrid size={20} />

          <span className={styles.triggerText}>
            دسته‌بندی کالاها
          </span>
        </div>

        <div
          className={styles.trigger}
          style={{
            paddingLeft: '4rem',
            cursor: 'pointer',
          }}
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
          style={{
            cursor: 'pointer',
          }}
          onClick={() =>
            router.push('/brands')
          }
        >
          <Tag size={18} />

          <span className={styles.triggerText}>
            برندها
          </span>
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
          <Tag size={18} />

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
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default FrontMenu;
