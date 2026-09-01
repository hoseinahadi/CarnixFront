'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Edit3,
  Home,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';

import AddressModal from '@/components/address/AddressModal';

import {
  CheckoutReferenceApi,
  type ShippingQuoteResponse,
} from '@/features/checkout/api/referenceDataApi';

import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import type { Cart } from '@/models/cart/Cart';

import {
  getApiErrorMessage,
  isRequestCanceled,
} from '@/services/api/common/apiError';

import {
  selectAddressLoading,
  selectAddresses,
} from '@/store/feature/address/AddressSelectors';

import {
  fetchAddresses,
} from '@/store/feature/address/AddressThunks';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import styles from './CartStep2.module.scss';

interface CartStep2Props {
  cart: Cart;

  onNext: (
    addressId: number,
    shippingMethod: string,
    shippingCost: number,
  ) => void;

  onBack: () => void;
}

interface ShippingMethod {
  shippingMethodId: number;
  name: string;
  code: string;
  description: string;
  baseCost: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  maxWeightKg: number | null;
  regionLimit: string | null;
}

interface ModalConfig {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  initialData?: AddressResponseDto;
}

const extractShippingMethods = (
  payload: unknown,
): ShippingMethod[] => {
  if (Array.isArray(payload)) {
    return payload as ShippingMethod[];
  }

  if (
    typeof payload !== 'object' ||
    payload === null
  ) {
    return [];
  }

  const source =
    payload as Record<string, unknown>;

  const candidates = [
    source.data,
    source.mainResults,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as ShippingMethod[];
    }

    if (
      typeof candidate === 'object' &&
      candidate !== null
    ) {
      const nested =
        candidate as Record<string, unknown>;

      if (Array.isArray(nested.data)) {
        return nested.data as ShippingMethod[];
      }

      if (
        Array.isArray(
          nested.mainResults,
        )
      ) {
        return nested.mainResults as ShippingMethod[];
      }
    }
  }

  return [];
};

const CartStep2 = ({
  cart,
  onNext,
  onBack,
}: CartStep2Props) => {
  const dispatch = useAppDispatch();

  const addresses = useAppSelector(selectAddresses);
  const addressesLoading = useAppSelector(selectAddressLoading);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingCode, setSelectedShippingCode] = useState('');
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteReady, setQuoteReady] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResponse | null>(null);

  const quoteRequestIdRef = useRef(0);

  const [modalKey, setModalKey] = useState(0);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    mode: 'create',
  });

  const itemsCount = cart.totalItemsCount || cart.items.length;
  const cartSubTotal = Number(cart.subTotal || 0);
  const cartDiscount = Number(cart.totalDiscount || 0);
  
  /* 🟢 کسر مالیات از جمع کل بک‌اند برای اطمینان ۱۰۰ درصدی */
  const cartTax = Number(cart.taxAmount || 0);

  const backendCartTotal = Number.isFinite(Number(cart.grandTotal))
      ? Math.max(0, Number(cart.grandTotal) - cartTax)
      : Math.max(0, cartSubTotal - cartDiscount);

  const finalTotal = Math.max(
      0,
      backendCartTotal + (quoteReady ? selectedShippingCost : 0)
  );

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const fetchShippingMethods = async () => {
        try {
          setShippingLoading(true);
          setShippingError(null);

          const response = await CheckoutReferenceApi.getShippingMethods();

          if (cancelled) return;

          const methods = extractShippingMethods(response.data)
              .filter(
                (method): method is ShippingMethod =>
                  Boolean(
                    method &&
                    method.isActive &&
                    method.shippingMethodId > 0 &&
                    typeof method.code === 'string' &&
                    method.code.trim().length > 0
                  )
              );

          if (methods.length === 0) {
            setShippingMethods([]);
            setSelectedShippingCode('');
            setSelectedShippingCost(0);
            setQuoteReady(false);
            setShippingError('در حال حاضر روش ارسال فعالی وجود ندارد.');
            return;
          }

          setShippingMethods(methods);

          setSelectedShippingCode((currentCode) => {
              const currentExists = methods.some((method) => method.code === currentCode);
              if (currentExists) return currentCode;
              return methods[0].code;
          });
        } catch (error: unknown) {
          if (cancelled || isRequestCanceled(error)) return;

          setShippingMethods([]);
          setSelectedShippingCode('');
          setSelectedShippingCost(0);
          setQuoteReady(false);
          setShippingError(getApiErrorMessage(error, 'امکان دریافت روش‌های ارسال وجود ندارد.'));
        } finally {
          if (!cancelled) setShippingLoading(false);
        }
      };

    void fetchShippingMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId(null);
      return;
    }

    const selectedStillExists = addresses.some(
        (address) => address.userAddressId === selectedAddressId
    );

    if (selectedStillExists) return;

    const defaultAddress = addresses.find((address) => address.isDefault);

    setSelectedAddressId(
      defaultAddress?.userAddressId ?? addresses[0].userAddressId
    );
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    const cartId = Number(cart.cartId);

    if (!Number.isFinite(cartId) || cartId <= 0 || !selectedAddressId || !selectedShippingCode) {
      setSelectedShippingCost(0);
      setShippingQuote(null);
      setQuoteReady(false);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    const requestId = ++quoteRequestIdRef.current;
    let cancelled = false;

    const loadQuote = async () => {
        try {
          setQuoteLoading(true);
          setQuoteError(null);
          setQuoteReady(false);
          setSelectedShippingCost(0);
          setShippingQuote(null);

          const response = await CheckoutReferenceApi.getShippingQuote({
                cartId,
                userAddressId: selectedAddressId,
                shippingMethod: selectedShippingCode,
          });

          if (cancelled || requestId !== quoteRequestIdRef.current) return;

          const result = response.data;

          if (!result || result.isSuccess !== true || !result.data) {
            throw new Error(result?.message || 'امکان محاسبه هزینه ارسال وجود ندارد.');
          }

          const quote = result.data;
          const cost = Number(quote.shippingCost);

          if (!Number.isFinite(cost) || cost < 0) {
            throw new Error('هزینه ارسال دریافت‌شده معتبر نیست.');
          }

          if (
            quote.shippingMethodCode &&
            quote.shippingMethodCode.trim().toLowerCase() !== selectedShippingCode.trim().toLowerCase()
          ) {
            throw new Error('پاسخ هزینه ارسال با روش انتخاب‌شده مطابقت ندارد.');
          }

          setSelectedShippingCost(cost);
          setShippingQuote(quote);
          setQuoteReady(true);
        } catch (error: unknown) {
          if (cancelled || requestId !== quoteRequestIdRef.current || isRequestCanceled(error)) return;

          setSelectedShippingCost(0);
          setShippingQuote(null);
          setQuoteReady(false);
          setQuoteError(getApiErrorMessage(error, 'امکان محاسبه هزینه ارسال برای آدرس و روش انتخاب‌شده وجود ندارد.'));
        } finally {
          if (!cancelled && requestId === quoteRequestIdRef.current) {
            setQuoteLoading(false);
          }
        }
      };

    void loadQuote();

    return () => {
      cancelled = true;
    };
  }, [cart.cartId, selectedAddressId, selectedShippingCode]);

  const handleShippingSelect = (method: ShippingMethod) => {
    if (shippingLoading || quoteLoading) return;
    if (selectedShippingCode === method.code) return;

    setSelectedShippingCode(method.code);
    setSelectedShippingCost(0);
    setShippingQuote(null);
    setQuoteReady(false);
    setQuoteError(null);
  };

  const handleSubmit = () => {
    if (!selectedAddressId) {
      window.alert('لطفاً یک آدرس انتخاب کنید');
      return;
    }

    if (!selectedShippingCode) {
      window.alert('لطفاً یک روش ارسال انتخاب کنید');
      return;
    }

    if (quoteLoading || !quoteReady || !shippingQuote) {
      window.alert(quoteError || 'هزینه ارسال هنوز محاسبه نشده است.');
      return;
    }

    onNext(selectedAddressId, selectedShippingCode, selectedShippingCost);
  };

  const openModal = (mode: ModalConfig['mode'], address?: AddressResponseDto) => {
    setModalKey((current) => current + 1);
    setModalConfig({
      isOpen: true,
      mode,
      initialData: address,
    });
  };

  const closeModal = useCallback(() => {
      setModalConfig({
        isOpen: false,
        mode: 'create',
      });
      void dispatch(fetchAddresses({ force: true }));
  }, [dispatch]);

  const formatCurrency = (amount: number) => amount.toLocaleString('fa-IR');

  const getDeliveryDaysText = (days: number) => {
    if (days === 0) return 'همان روز';
    if (days === 1) return '۱ روز کاری';
    return `${days.toLocaleString('fa-IR')} روز کاری`;
  };

  if (addressesLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری آدرس‌ها...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>آدرس‌ها</h3>
        <p className={styles.sectionSubtitle}>
          لطفاً از بین آدرس‌های موجود یکی را انتخاب کنید
        </p>
      </div>

      <div className={styles.step2Container}>
        <div className={styles.addressesSection}>
          <div className={styles.addressList}>
            {addresses.length === 0 ? (
              <div className={styles.noAddress}>
                <div className={styles.noAddressIcon}>
                  <Home size={48} />
                </div>
                <p>هیچ آدرسی ثبت نشده است</p>
                <button
                  type="button"
                  className={styles.addFirstAddressBtn}
                  onClick={() => openModal('create')}
                >
                  <Plus size={20} />
                  ثبت اولین آدرس
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                  <div
                    key={address.userAddressId}
                    className={`${styles.addressCard} ${selectedAddressId === address.userAddressId ? styles.selected : ''}`}
                    onClick={() => setSelectedAddressId(address.userAddressId)}
                  >
                    <div className={styles.addressHeader}>
                      <div className={styles.addressTitleWrapper}>
                        <span className={styles.addressTitle}>{address.addressTitle}</span>
                        {address.isDefault && (
                          <span className={styles.defaultBadge}>پیش‌فرض</span>
                        )}
                      </div>

                      <div className={styles.addressActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label="ویرایش آدرس"
                          onClick={(event) => {
                            event.stopPropagation();
                            openModal('edit', address);
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          aria-label="حذف آدرس"
                          onClick={(event) => {
                            event.stopPropagation();
                            openModal('delete', address);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.addressBody}>
                      <div className={styles.addressText}>
                        <MapPin size={16} />
                        <span>{address.fullAddress}</span>
                      </div>
                      <div className={styles.addressFooter}>
                        <span>👤 {address.recipientName}</span>
                        <span>📞 {address.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}

            {addresses.length > 0 && (
              <button
                type="button"
                className={styles.addAddressBtn}
                onClick={() => openModal('create')}
              >
                <Plus size={20} />
                افزودن آدرس جدید
              </button>
            )}
          </div>

          <div className={styles.shippingSection}>
            <h3 className={styles.shippingTitle}>نحوه ارسال</h3>

            {shippingError && (
              <div className={styles.shippingError}>
                ⚠️ {shippingError}
              </div>
            )}

            {quoteError && (
              <div className={styles.shippingError}>
                ⚠️ {quoteError}
              </div>
            )}

            {shippingLoading ? (
              <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={24} />
                <p>در حال بارگذاری روش‌های ارسال...</p>
              </div>
            ) : shippingMethods.length === 0 ? (
              <div className={styles.noMethods}>
                <p>روش ارسال فعالی یافت نشد.</p>
              </div>
            ) : (
              <div className={styles.shippingMethods}>
                {shippingMethods.map((method) => {
                    const isSelected = selectedShippingCode === method.code;

                    return (
                      <div
                        key={method.shippingMethodId}
                        className={`${styles.shippingMethod} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleShippingSelect(method)}
                      >
                        <div className={styles.methodInfo}>
                          <div className={styles.methodName}>
                            <Truck size={18} />
                            <span>{method.name}</span>
                          </div>

                          <div className={styles.methodDetails}>
                            <span className={styles.methodPrice}>
                              {isSelected && quoteLoading
                                ? 'در حال محاسبه...'
                                : isSelected && quoteReady
                                  ? selectedShippingCost > 0
                                    ? `${formatCurrency(selectedShippingCost)} تومان`
                                    : 'رایگان'
                                  : method.baseCost > 0
                                    ? `پایه ${formatCurrency(method.baseCost)} تومان`
                                    : 'هزینه پایه: رایگان'}
                            </span>

                            <span className={styles.methodDays}>
                              {getDeliveryDaysText(
                                isSelected && shippingQuote
                                  ? shippingQuote.estimatedDeliveryDays
                                  : method.estimatedDeliveryDays,
                              )}
                            </span>
                          </div>

                          {method.description && (
                            <div className={styles.methodDescription}>
                              {method.description}
                            </div>
                          )}

                          {method.regionLimit && (
                            <div className={styles.methodUnavailable}>
                              محدوده سرویس: {method.regionLimit}
                            </div>
                          )}
                        </div>

                        <div className={styles.radioCircle}>
                          {isSelected && <div className={styles.radioInner} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryHeader}>
            <h3>خلاصه سفارش</h3>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>تعداد کالا</span>
              <span>{itemsCount.toLocaleString('fa-IR')} عدد</span>
            </div>

            <div className={styles.summaryRow}>
              <span>قیمت کالاها</span>
              <span>{formatCurrency(cartSubTotal)} تومان</span>
            </div>

            {cartDiscount > 0 && (
              <div className={styles.summaryRow}>
                <span>تخفیف</span>
                <span>-{formatCurrency(cartDiscount)} تومان</span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span>
                {!selectedAddressId || !selectedShippingCode
                  ? 'انتخاب نشده'
                  : quoteLoading
                    ? 'در حال محاسبه...'
                    : quoteReady
                      ? selectedShippingCost > 0
                        ? `${formatCurrency(selectedShippingCost)} تومان`
                        : 'رایگان'
                      : 'نامشخص'}
              </span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.summaryRowTotal}>
              <span>جمع کل</span>
              <span>{formatCurrency(finalTotal)} تومان</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={onBack}
              disabled={quoteLoading}
            >
              بازگشت
            </button>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={handleSubmit}
              disabled={
                !selectedAddressId ||
                !selectedShippingCode ||
                shippingLoading ||
                quoteLoading ||
                !quoteReady ||
                Boolean(quoteError)
              }
            >
              {quoteLoading ? 'در حال محاسبه هزینه ارسال...' : 'ادامه'}
            </button>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <AddressModal
          key={modalKey}
          isOpen={modalConfig.isOpen}
          onClose={closeModal}
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
        />
      )}
    </>
  );
};

export default CartStep2;