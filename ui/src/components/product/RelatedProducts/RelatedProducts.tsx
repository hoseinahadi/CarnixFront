'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  type MouseEvent,
} from 'react';
import {
  Banknote,
  CarFront,
  ShoppingCart,
} from 'lucide-react';

import type {
  RelatedProductApiItem,
  RelatedProductsResponse,
} from '@/features/product/api/productRelatedApi';
import type {
  ProductBundleDto,
  ProductBundleItemDto,
} from '@/models/ProductBundle/ProductBundle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/feature/cart/cartThunks';
import {
  selectBundlesLoading,
  selectProductBundles,
  selectRelatedLoading,
  selectRelatedProducts,
} from '@/store/feature/product/productDetailSelectors';
import { fetchRelatedProducts } from '@/store/feature/product/productRelatedThunks';
import { fetchProductBundles } from '@/store/feature/product/productThunks';

import styles from './RelatedProducts.module.scss';

interface RelatedProductsProps {
  productId: number;
}

interface RecommendationItem {
  id: number;
  name: string;
  price: number | null;
  imageUrl?: string;
  carModel?: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : {};
}

function getString(
  ...values: unknown[]
): string | undefined {
  const value = values.find(
    (item) =>
      typeof item === 'string' &&
      item.trim().length > 0,
  );

  return typeof value === 'string'
    ? value.trim()
    : undefined;
}

function getNumber(
  ...values: unknown[]
): number | undefined {
  for (const value of values) {
    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function getImageUrl(record: UnknownRecord):
  | string
  | undefined {
  const directImage = getString(
    record.imageUrl,
    record.mainImageUrl,
    record.thumbnailUrl,
  );

  if (directImage) {
    return directImage;
  }

  const images = Array.isArray(record.images)
    ? record.images
    : [];

  const firstImage = images
    .map(asRecord)
    .find((image) =>
      Boolean(
        getString(
          image.imageUrl,
          image.url,
        ),
      ),
    );

  return firstImage
    ? getString(
        firstImage.imageUrl,
        firstImage.url,
      )
    : undefined;
}

function normalizeRelatedCollection(
  payload: RelatedProductsResponse | null,
): RelatedProductApiItem[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = [
    payload.all,
    payload.items,
    payload.products,
    payload.sameCategory,
    payload.sameBrand,
  ];

  return candidates.find(Array.isArray) || [];
}

function toRelatedRecommendation(
  item: RelatedProductApiItem,
): RecommendationItem | null {
  const raw = asRecord(item);
  const nested = asRecord(
    raw.relatedProduct || raw.product,
  );
  const source =
    Object.keys(nested).length > 0
      ? nested
      : raw;

  const id = getNumber(
    source.productId,
    raw.relatedProductId,
    raw.productId,
  );

  if (!id) {
    return null;
  }

  const name =
    getString(
      source.productName,
      source.name,
      raw.relatedProductName,
      raw.productName,
    ) || `محصول مرتبط شماره ${id}`;

  const price = getNumber(
    source.effectivePrice,
    source.basePrice,
    source.price,
    raw.effectivePrice,
    raw.basePrice,
    raw.price,
  );

  return {
    id,
    name,
    price: price ?? null,
    imageUrl:
      getImageUrl(source) ||
      getImageUrl(raw),
    carModel: getString(
      source.categoryName,
      source.vehicleName,
      source.carModel,
      raw.categoryName,
    ),
  };
}

function toBundleRecommendation(
  item: ProductBundleItemDto,
): RecommendationItem | null {
  if (!item.productId) {
    return null;
  }

  return {
    id: item.productId,
    name:
      item.productName ||
      `محصول شماره ${item.productId}`,
    price:
      typeof item.unitPrice === 'number'
        ? item.unitPrice
        : null,
  };
}

function uniqueByProductId(
  items: RecommendationItem[],
): RecommendationItem[] {
  const seen = new Set<number>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getBundleItems(
  bundles: ProductBundleDto[],
  currentProductId: number,
): RecommendationItem[] {
  const items = bundles.flatMap(
    (bundle) => bundle.items || [],
  );

  return uniqueByProductId(
    items
      .filter(
        (item) =>
          item.productId !== currentProductId,
      )
      .map(toBundleRecommendation)
      .filter(
        (
          item,
        ): item is RecommendationItem =>
          item !== null,
      ),
  ).slice(0, 3);
}

export default function RelatedProducts({
  productId,
}: RelatedProductsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const relatedData = useAppSelector(
    selectRelatedProducts,
  );
  const relatedLoading = useAppSelector(
    selectRelatedLoading,
  );
  const bundles = useAppSelector(
    selectProductBundles,
  );
  const bundlesLoading = useAppSelector(
    selectBundlesLoading,
  );

  useEffect(() => {
    void dispatch(
      fetchRelatedProducts({ productId }),
    );
    void dispatch(
      fetchProductBundles({ productId }),
    );
  }, [dispatch, productId]);

  const relatedProducts = useMemo(() => {
    return uniqueByProductId(
      normalizeRelatedCollection(relatedData)
        .map(toRelatedRecommendation)
        .filter(
          (
            item,
          ): item is RecommendationItem =>
            item !== null &&
            item.id !== productId,
        ),
    ).slice(0, 4);
  }, [productId, relatedData]);

  const bundleProducts = useMemo(
    () =>
      getBundleItems(
        bundles,
        productId,
      ),
    [bundles, productId],
  );

  const handleAddToCart = (
    event: MouseEvent<HTMLButtonElement>,
    recommendationProductId: number,
  ) => {
    event.stopPropagation();

    void dispatch(
      addToCart({
        productId:
          recommendationProductId,
        quantity: 1,
      }),
    );
  };

  const renderProductCard = (
    item: RecommendationItem,
    keyPrefix: string,
  ) => (
    <div
      key={`${keyPrefix}-${item.id}`}
      className={styles.productCard}
      role="link"
      tabIndex={0}
      onClick={() =>
        router.push(`/product/${item.id}`)
      }
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          router.push(`/product/${item.id}`);
        }
      }}
    >
      <div className={styles.imageSection}>
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={styles.image}
            sizes="200px"
          />
        ) : (
          <ShoppingCart
            size={40}
            className={styles.fallbackIcon}
          />
        )}
      </div>

      <div className={styles.infoSection}>
        <h4 className={styles.productTitle}>
          {item.name}
        </h4>

        {item.carModel && (
          <div className={styles.carTag}>
            <span>{item.carModel}</span>
            <CarFront size={14} />
          </div>
        )}

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.cartBtn}
            onClick={(event) =>
              handleAddToCart(event, item.id)
            }
            aria-label={`افزودن ${item.name} به سبد خرید`}
          >
            <ShoppingCart size={18} />
          </button>

          <div className={styles.priceSection}>
            {item.price !== null &&
            item.price > 0 ? (
              <>
                <span className={styles.price}>
                  {item.price.toLocaleString(
                    'fa-IR',
                  )}
                </span>
                <span
                  className={styles.currency}
                >
                  تومان
                </span>
                <Banknote
                  size={16}
                  className={styles.moneyIcon}
                />
              </>
            ) : (
              <span className={styles.currency}>
                مشاهده محصول
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (
    (relatedLoading || bundlesLoading) &&
    relatedProducts.length === 0 &&
    bundleProducts.length === 0
  ) {
    return (
      <div className={styles.loadingSkeleton}>
        در حال دریافت پیشنهادها...
      </div>
    );
  }

  if (
    bundleProducts.length === 0 &&
    relatedProducts.length === 0
  ) {
    return null;
  }

  return (
    <div
      className={
        styles.recommendationsContainer
      }
    >
      {bundleProducts.length > 0 && (
        <div className={styles.bundleSection}>
          <h3 className={styles.sectionTitle}>
            مکمل سفارش با این محصول
          </h3>
          <div className={styles.bundleGrid}>
            {bundleProducts.map((item) =>
              renderProductCard(
                item,
                'bundle',
              ),
            )}
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.sectionTitle}>
            محصولات مشابه
          </h3>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) =>
              renderProductCard(
                item,
                'related',
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
