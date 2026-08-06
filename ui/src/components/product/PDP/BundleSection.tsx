'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import styles from './BundleSection.module.scss';
import { addToCart } from '@/store/feature/cart/cartThunks';
import { selectProductBundles } from '@/store/feature/product/productSelectors';
import { ShoppingBag, Plus } from 'lucide-react';

export const BundleSection = () => {
  const dispatch = useAppDispatch();
  const bundles = useAppSelector(selectProductBundles);

  // اگر باندلی وجود نداشت، هیچی رندر نمی‌کند (و تب آن هم در page.tsx ساخته نمی‌شود)
  if (!bundles || bundles.length === 0) return null;

  const handleAddBundleToCart = (bundle: any) => {
    if (bundle.items && bundle.items.length > 0) {
      bundle.items.forEach((item: any) => {
        dispatch(addToCart({ productId: item.productId, quantity: item.quantity }));
      });
    }
  };

  return (
    <div className={styles.bundleContainer}>
      <div className={styles.bundleHeader}>
        <ShoppingBag className={styles.headerIcon} size={24} />
        <h3 className={styles.title}>پیشنهاد خرید پکیج (مقرون به‌صرفه‌تر)</h3>
      </div>
      
      <div className={styles.bundleCardsWrapper}>
        {bundles.map((bundle: any) => (
          <div key={bundle.productBundleId} className={styles.bundleCard}>
            <div className={styles.bundleInfo}>
              <h4 className={styles.bundleName}>{bundle.name}</h4>
              {bundle.description && <p className={styles.bundleDesc}>{bundle.description}</p>}
            </div>

            <div className={styles.itemsList}>
              {bundle.items?.map((item: any, index: number) => (
                <React.Fragment key={item.productBundleItemId}>
                  <div className={styles.bundleItem}>
                    <div className={styles.itemBullet}></div>
                    <span className={styles.itemName}>
                      {item.productName || `قطعه کد ${item.productId}`}
                    </span>
                    <span className={styles.itemQty}>({item.quantity} عدد)</span>
                  </div>
                  {/* نمایش علامت + بین آیتم‌ها به جز آخری */}
                  {index < bundle.items.length - 1 && (
                    <div className={styles.plusDivider}>
                      <Plus size={16} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button 
              className={styles.addBundleBtn}
              onClick={() => handleAddBundleToCart(bundle)}
            >
              افزودن تمام قطعات بسته به سبد خرید
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};