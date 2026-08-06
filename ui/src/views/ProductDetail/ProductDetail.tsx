'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  HeadphonesIcon,
  ShieldCheck,
  Trophy,
  Truck,
} from 'lucide-react';

import BuyBox from '@/components/product/BuyBox/BuyBox';
import ProductGallery from '@/components/product/ProductGallery/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo/ProductInfo';
import ProductSpecifications from '@/components/product/ProductSpecifications/ProductSpecifications';
import ProductTabs from '@/components/product/ProductTabs/ProductTabs';
import LazyMount from '@/components/utils/lazy/LazyMount';
import type { FeatureValueItem } from '@/models/Featurevalues/FeatureValueItem';
import type { ProductDetails } from '@/models/product/ProductDetails';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearProductDetail,
  initializeProductDetail,
} from '@/store/feature/product/productDetailSlice';
import { fetchEffectivePrice } from '@/store/feature/product/productThunks';
import {
  clearProductDetails,
  setProductDetails,
} from '@/store/feature/product/productSlice';
import { selectProductDetails } from '@/store/feature/product/productSelectors';

import styles from './ProductDetail.module.scss';

const ProductReviews = dynamic(
  () =>
    import(
      '@/components/product/ProductReviews/ProductReviews'
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingTab}>
        در حال بارگذاری نظرات...
      </div>
    ),
  },
);

const ProductQuestions = dynamic(
  () =>
    import(
      '@/components/product/ProductQuestions/ProductQuestions'
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingTab}>
        در حال بارگذاری پرسش‌ها...
      </div>
    ),
  },
);

const RelatedProducts = dynamic(
  () =>
    import(
      '@/components/product/RelatedProducts/RelatedProducts'
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loadingTab}>
        در حال بارگذاری پیشنهادها...
      </div>
    ),
  },
);

interface ProductDetailPageProps {
  initialProduct: ProductDetails;
}

interface ProductTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface NormalizedSpecification {
  featureValueId?: number;
  featureId?: number;
  featureName: string;
  valueString?: string | null;
  valueNumeric?: number | null;
  optionName?: string | null;
  unit?: string | null;
  source?: string;
}

function parseFeatureValues(
  featureValues: unknown,
): FeatureValueItem[] {
  if (Array.isArray(featureValues)) {
    return featureValues as FeatureValueItem[];
  }

  if (typeof featureValues !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(featureValues);

    return Array.isArray(parsed)
      ? (parsed as FeatureValueItem[])
      : [];
  } catch {
    return [];
  }
}

function hasRealSpecifications(
  product: ProductDetails,
): boolean {
  return parseFeatureValues(
    product.featureValues,
  ).some((feature) => {
    const value =
      feature.optionName ??
      feature.valueString ??
      feature.valueNumeric;

    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== '-'
    );
  });
}

function getDefaultTab(
  product: ProductDetails,
): string {
  if (
    product.fullDescription ||
    product.shortDescription
  ) {
    return 'description';
  }

  if (hasRealSpecifications(product)) {
    return 'specifications';
  }

  return 'reviews';
}

export default function ProductDetailPageClient({
  initialProduct,
}: ProductDetailPageProps) {
  const dispatch = useAppDispatch();
  const storeProduct = useAppSelector(
    selectProductDetails,
  );
  const tabsSectionRef =
    useRef<HTMLDivElement>(null);

  const product =
    storeProduct?.productId ===
    initialProduct.productId
      ? storeProduct
      : initialProduct;

  const [activeTab, setActiveTab] =
    useState<string>(() =>
      getDefaultTab(initialProduct),
    );

  useEffect(() => {
    const productId =
      initialProduct.productId;

    dispatch(
      initializeProductDetail(productId),
    );
    dispatch(
      setProductDetails(initialProduct),
    );

    /*
     * قیمت برای BuyBox بالای صفحه لازم است؛ بنابراین تنها
     * درخواست تکمیلی‌ای است که بلافاصله اجرا می‌شود.
     */
    void dispatch(
      fetchEffectivePrice({ productId }),
    );

    setActiveTab(
      getDefaultTab(initialProduct),
    );

    return () => {
      dispatch(clearProductDetails());
      dispatch(clearProductDetail());
    };
  }, [dispatch, initialProduct]);

  const handleNavigateToTab = (
    tabId: string,
  ) => {
    setActiveTab(tabId);

    window.setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const specifications = useMemo<
    NormalizedSpecification[]
  >(() => {
    return parseFeatureValues(
      product.featureValues,
    ).map((feature) => ({
      featureValueId:
        feature.featureValueId,
      featureId: feature.featureId,
      featureName:
        feature.featureName || 'ویژگی',
      valueString: feature.valueString,
      valueNumeric: feature.valueNumeric,
      optionName: feature.optionName,
      unit: feature.unit,
      source: feature.source || 'Product',
    }));
  }, [product.featureValues]);

  const tabs = useMemo<ProductTab[]>(() => {
    const result: ProductTab[] = [];

    if (
      product.fullDescription ||
      product.shortDescription
    ) {
      result.push({
        id: 'description',
        label: 'توضیحات محصول',
        content: (
          <div
            className={styles.descriptionTab}
          >
            {product.fullDescription ? (
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    product.fullDescription,
                }}
              />
            ) : (
              <p>
                {product.shortDescription}
              </p>
            )}
          </div>
        ),
      });
    }

    result.push({
      id: 'specifications',
      label: 'مشخصات فنی',
      content: (
        <ProductSpecifications
          specifications={specifications}
        />
      ),
    });

    result.push(
      {
        id: 'reviews',
        label: 'نظرات کاربران',
        content: (
          <ProductReviews
            productId={product.productId}
          />
        ),
      },
      {
        id: 'questions',
        label: 'پرسش و پاسخ',
        content: (
          <ProductQuestions
            productId={product.productId}
          />
        ),
      },
    );

    return result;
  }, [product, specifications]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <Link
          href="/products"
          className={styles.breadcrumbLink}
        >
          محصولات
        </Link>

        {product.categoryName &&
          product.categoryName !== 'نامشخص' && (
            <>
              <span
                className={styles.separator}
              >
                /
              </span>

              <Link
                href={`/products/${product.categoryId}`}
                className={
                  styles.breadcrumbLink
                }
              >
                {product.categoryName}
              </Link>
            </>
          )}

        <span className={styles.separator}>
          /
        </span>
        <span className={styles.current}>
          {product.productName}
        </span>
      </div>

      <section className={styles.topSection}>
        <div className={styles.galleryColumn}>
          <ProductGallery />
        </div>

        <div className={styles.infoColumn}>
          <ProductInfo
            onNavigateToTab={
              handleNavigateToTab
            }
          />
        </div>

        <div className={styles.buyBoxColumn}>
          <BuyBox />
        </div>
      </section>

      <section
        className={styles.featuresBanner}
      >
        <div className={styles.featureBox}>
          <Trophy
            size={32}
            strokeWidth={1}
          />
          <div className={styles.featureText}>
            <h4>تضمین کیفیت</h4>
            <p>
              ساخته شده با بهترین متریال
            </p>
          </div>
        </div>

        <div className={styles.featureBox}>
          <ShieldCheck
            size={32}
            strokeWidth={1}
          />
          <div className={styles.featureText}>
            <h4>گارانتی</h4>
            <p>شش ماه خدمات پس از فروش</p>
          </div>
        </div>

        <div className={styles.featureBox}>
          <Truck
            size={32}
            strokeWidth={1}
          />
          <div className={styles.featureText}>
            <h4>ارسال سریع</h4>
            <p>
              ارسال سریع محصول به سراسر کشور
            </p>
          </div>
        </div>

        <div className={styles.featureBox}>
          <HeadphonesIcon
            size={32}
            strokeWidth={1}
          />
          <div className={styles.featureText}>
            <h4>پشتیبانی</h4>
            <p>پاسخگویی ۷ روز هفته</p>
          </div>
        </div>
      </section>

      <section
        className={styles.bottomSection}
        ref={tabsSectionRef}
      >
        <div className={styles.tabsWrapper}>
          <ProductTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            defaultTab={getDefaultTab(product)}
          />
        </div>
      </section>

      <section
        className={styles.relatedSection}
      >
        <LazyMount
          rootMargin="600px 0px"
          minHeight={380}
          fallback={
            <div className={styles.loadingTab}>
              پیشنهادهای مرتبط در ادامه
              بارگذاری می‌شوند.
            </div>
          }
        >
          <RelatedProducts
            productId={product.productId}
          />
        </LazyMount>
      </section>
    </div>
  );
}
