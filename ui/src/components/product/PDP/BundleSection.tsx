'use client';

import React, { useCallback, useState } from 'react';
import { ShoppingBag, Plus, LoaderCircle } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, fetchMyCart } from '@/store/feature/cart/cartThunks';
import { selectProductBundles } from '@/store/feature/product/productSelectors';

import styles from './BundleSection.module.scss';

interface BundleItemLike {
  productBundleItemId?: number;
  productId: number;
  productName?: string;
  quantity: number;
}

interface BundleLike {
  productBundleId: number;
  name: string;
  description?: string;
  items?: BundleItemLike[];
}

export const BundleSection = () => {
  const dispatch = useAppDispatch();
  const bundles = useAppSelector(selectProductBundles) as BundleLike[];
  const [addingBundleId, setAddingBundleId] = useState<number | null>(null);

  const handleAddBundleToCart = useCallback(
    async (bundle: BundleLike) => {
      const items = bundle.items?.filter((item) => item.productId && item.quantity > 0) ?? [];
      if (items.length === 0 || addingBundleId !== null) return;

      setAddingBundleId(bundle.productBundleId);

      try {
        // همه mutationها انجام می‌شوند، اما به‌جای یک GET سبد برای هر آیتم،
        // فقط یک بار در پایان سبد را refresh می‌کنیم.
        const results = await Promise.all(
          items.map((item) =>
            dispatch(
              addToCart({
                productId: item.productId,
                quantity: item.quantity,
                refreshCart: false,
              }),
            ),
          ),
        );

        const hasSuccess = results.some((result) => addToCart.fulfilled.match(result));
        if (hasSuccess) {
          await dispatch(fetchMyCart({ force: true }));
        }
      } finally {
        setAddingBundleId(null);
      }
    },
    [addingBundleId, dispatch],
  );

  if (!bundles || bundles.length === 0) return null;

  return (
    <div className={styles.bundleContainer}>
      <div className={styles.bundleHeader}>
        <ShoppingBag className={styles.headerIcon} size={24} />
        <h3 className={styles.title}>پیشنهاد خرید پکیج (مقرون به‌صرفه‌تر)</h3>
      </div>

      <div className={styles.bundleCardsWrapper}>
        {bundles.map((bundle) => {
          const isAdding = addingBundleId === bundle.productBundleId;

          return (
            <div key={bundle.productBundleId} className={styles.bundleCard}>
              <div className={styles.bundleInfo}>
                <h4 className={styles.bundleName}>{bundle.name}</h4>
                {bundle.description && <p className={styles.bundleDesc}>{bundle.description}</p>}
              </div>

              <div className={styles.itemsList}>
                {bundle.items?.map((item, index) => (
                  <React.Fragment key={item.productBundleItemId ?? `${item.productId}-${index}`}>
                    <div className={styles.bundleItem}>
                      <div className={styles.itemBullet} />
                      <span className={styles.itemName}>
                        {item.productName || `قطعه کد ${item.productId}`}
                      </span>
                      <span className={styles.itemQty}>({item.quantity} عدد)</span>
                    </div>
                    {index < (bundle.items?.length ?? 0) - 1 && (
                      <div className={styles.plusDivider}>
                        <Plus size={16} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button
                className={styles.addBundleBtn}
                onClick={() => void handleAddBundleToCart(bundle)}
                disabled={addingBundleId !== null}
                aria-busy={isAdding}
              >
                {isAdding ? (
                  <>
                    <LoaderCircle className={styles.spinner} size={20} aria-hidden="true" />
                    در حال افزودن بسته...
                  </>
                ) : (
                  'افزودن تمام قطعات بسته به سبد خرید'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
