'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import {
  applyCoupon,
  placeOrderFromCart,
} from '@/store/feature/cart/cartThunks';

import {
  selectCartActionLoading,
} from '@/store/feature/cart/cartSelectors';

import {
  selectAddresses,
} from '@/store/feature/address/AddressSelectors';

import {
  CheckoutReferenceApi,
} from '@/features/checkout/api/referenceDataApi';

import {
  CartApi,
} from '@/features/cart/api/CartApi';

import {
  calculateRoundedCartDiscount,
  calculateRoundedCartSubtotal,
  formatPrice,
  roundPrice,
} from '@/utils/price';

import styles from './CartStep3.module.scss';

interface PaymentMethod {
  paymentMethodId: number;
  name: string;
  description: string;
  methodType: string;
  displayOrder: number;
  configurationJson: string;
}

interface CartStep3Props {
  cart: any;
  onBack: () => void;
  shippingMethod: string;
  shippingCost: number;
  selectedAddressId: number | null;
}

const CartStep3: React.FC<CartStep3Props> = ({
  cart,
  onBack,
  shippingMethod,
  shippingCost,
  selectedAddressId,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const actionLoading =
    useAppSelector(
      selectCartActionLoading,
    );

  const addresses =
    useAppSelector(
      selectAddresses,
    );

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<PaymentMethod[]>([]);

  const [
    loadingPaymentMethods,
    setLoadingPaymentMethods,
  ] = useState(true);

  const [
    paymentMethodsError,
    setPaymentMethodsError,
  ] = useState('');

  const [
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
  ] = useState<number | null>(null);

  const [
    selectedPaymentType,
    setSelectedPaymentType,
  ] = useState('');

  const [
    couponCode,
    setCouponCode,
  ] = useState('');

  const [
    couponApplied,
    setCouponApplied,
  ] = useState(false);

  const [
    couponLoading,
    setCouponLoading,
  ] = useState(false);

  const [
    couponMessage,
    setCouponMessage,
  ] = useState('');

  const [
    orderNotes,
    setOrderNotes,
  ] = useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  /*
   * وضعیت جدا برای Validate.
   *
   * این باعث می‌شود کاربر هنگام بررسی نهایی
   * نتواند چند بار روی ثبت سفارش کلیک کند.
   */
  const [
    validatingCart,
    setValidatingCart,
  ] = useState(false);

  const selectedAddress =
    addresses.find(
      (address) =>
        address.userAddressId ===
        selectedAddressId,
    );

  const itemsCount =
    cart?.totalItemsCount ||
    cart?.items?.length ||
    0;

  const cartSubTotal =
    calculateRoundedCartSubtotal(
      cart,
    );

  const cartDiscountTotal =
    calculateRoundedCartDiscount(
      cart,
    );

  const roundedShippingCost =
    roundPrice(
      shippingCost || 0,
    );

  /*
   * مبلغ Cart فقط از اطلاعات Backend.
   */
  const backendCartTotal =
    roundPrice(
      Number.isFinite(
        Number(cart?.grandTotal),
      )
        ? Number(
            cart.grandTotal,
          )
        : (
            cartSubTotal -
            cartDiscountTotal +
            Number(
              cart?.taxAmount ||
                0,
            )
          ),
    );

  /*
   * فعلاً Shipping جداگانه در Step 2
   * محاسبه می‌شود.
   *
   * این بخش را در مرحله Shipping Quote
   * Server-side می‌کنیم.
   */
  const finalAmount =
    Math.max(
      0,
      backendCartTotal +
        roundedShippingCost,
    );

  const formatCurrency = (
    amount: number,
  ) => formatPrice(amount);

  const getPaymentIcon = (
    methodType: string,
  ) => {
    switch (methodType) {
      case 'ONLINE':
        return '💳';

      case 'INSTALLMENT':
        return '🟣';

      case 'COD':
        return '🚪';

      default:
        return '💰';
    }
  };

  const shippingMethodLabels: Record<
    string,
    string
  > = {
    post: 'پست پیشتاز',
    tipax: 'تیپاکس',
    peyk: 'پیک',

    STANDARD: 'پست پیشتاز',
    TIPAX: 'تیپاکس',
    PICKUP: 'پیک',
  };

  /*
   * ==========================================================
   * PAYMENT METHODS
   * ==========================================================
   */
  useEffect(() => {
    let cancelled = false;

    const fetchPaymentMethods =
      async () => {
        setLoadingPaymentMethods(
          true,
        );

        setPaymentMethodsError('');

        try {
          const response =
            await CheckoutReferenceApi
              .getPaymentMethods();

          if (cancelled) {
            return;
          }

          const data =
            response.data;

          let methods:
            PaymentMethod[] = [];

          if (
            Array.isArray(data)
          ) {
            methods = data;
          } else if (
            Array.isArray(
              data?.data,
            )
          ) {
            methods =
              data.data;
          } else if (
            Array.isArray(
              data?.mainResults,
            )
          ) {
            methods =
              data.mainResults;
          }

          methods =
            methods.filter(
              (method) =>
                Number.isFinite(
                  Number(
                    method
                      .paymentMethodId,
                  ),
                ) &&
                Number(
                  method
                    .paymentMethodId,
                ) > 0,
            );

          setPaymentMethods(
            methods,
          );

          if (
            methods.length > 0
          ) {
            const firstMethod =
              methods[0];

            setSelectedPaymentMethodId(
              firstMethod
                .paymentMethodId,
            );

            setSelectedPaymentType(
              firstMethod
                .methodType,
            );

            return;
          }

          setSelectedPaymentMethodId(
            null,
          );

          setSelectedPaymentType(
            '',
          );

          setPaymentMethodsError(
            'در حال حاضر روش پرداخت فعالی در دسترس نیست.',
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            'خطا در دریافت روش‌های پرداخت:',
            error,
          );

          setPaymentMethods([]);

          setSelectedPaymentMethodId(
            null,
          );

          setSelectedPaymentType(
            '',
          );

          setPaymentMethodsError(
            'دریافت روش‌های پرداخت با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
          );
        } finally {
          if (!cancelled) {
            setLoadingPaymentMethods(
              false,
            );
          }
        }
      };

    void fetchPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ==========================================================
   * APPLY COUPON
   * ==========================================================
   */
  const handleApplyCoupon =
    async () => {
      const normalizedCode =
        couponCode.trim();

      if (
        !normalizedCode ||
        couponLoading ||
        couponApplied
      ) {
        return;
      }

      const cartId =
        Number(
          cart?.cartId ||
            cart?.id,
        );

      if (
        !Number.isFinite(
          cartId,
        ) ||
        cartId <= 0
      ) {
        setErrorMessage(
          'سبد خرید معتبر نیست.',
        );

        return;
      }

      setCouponLoading(true);
      setCouponMessage('');
      setErrorMessage('');

      try {
        const result =
          (await dispatch(
            applyCoupon({
              cartId,
              couponCode:
                normalizedCode,
            }),
          ).unwrap()) as {
            message?: string;
          };

        setCouponApplied(
          true,
        );

        setCouponMessage(
          result?.message ||
            'کد تخفیف با موفقیت روی سبد خرید اعمال شد.',
        );
      } catch (
        error: unknown
      ) {
        setCouponApplied(
          false,
        );

        setCouponMessage('');

        setErrorMessage(
          typeof error ===
            'string'
            ? error
            : 'کد تخفیف معتبر نیست یا امکان اعمال آن وجود ندارد.',
        );
      } finally {
        setCouponLoading(
          false,
        );
      }
    };

  /*
   * ==========================================================
   * VALIDATE CART
   * ==========================================================
   *
   * درست قبل از ساخت Order اجرا می‌شود.
   */
  const validateCartBeforeOrder =
    async (
      cartId: number,
    ): Promise<boolean> => {
      try {
        const response =
          await CartApi.validateCart(
            cartId,
          );

        const result =
          response.data;

        /*
         * OperationResult ناموفق.
         */
        if (
          !result ||
          result.isSuccess !== true
        ) {
          setErrorMessage(
            result?.message ||
              'سبد خرید معتبر نیست. لطفاً سبد خود را بررسی کنید.',
          );

          return false;
        }

        /*
         * بعضی پیاده‌سازی‌ها ممکن است
         * data = false برگردانند.
         */
        if (
          result.data === false
        ) {
          setErrorMessage(
            result.message ||
              'سبد خرید معتبر نیست. قیمت یا موجودی یکی از کالاها تغییر کرده است.',
          );

          return false;
        }

        /*
         * اگر Backend یک Object شامل isValid برگرداند
         * این حالت هم پشتیبانی شود.
         */
        if (
          typeof result.data ===
            'object' &&
          result.data !== null &&
          'isValid' in
            result.data &&
          (
            result.data as {
              isValid?: boolean;
            }
          ).isValid === false
        ) {
          setErrorMessage(
            result.message ||
              'سبد خرید نیاز به بررسی مجدد دارد.',
          );

          return false;
        }

        return true;
      } catch (
        error: unknown
      ) {
        setErrorMessage(
          typeof error ===
            'string'
            ? error
            : (
                error instanceof
                Error
              )
              ? error.message
              : 'امکان اعتبارسنجی سبد خرید وجود ندارد.',
        );

        return false;
      }
    };

  /*
   * ==========================================================
   * PLACE ORDER
   * ==========================================================
   */
  const handlePayment =
    async () => {
      if (
        actionLoading ||
        validatingCart
      ) {
        return;
      }

      setErrorMessage('');

      if (!selectedAddress) {
        setErrorMessage(
          'لطفاً به مرحله قبل برگشته و آدرس خود را انتخاب کنید.',
        );

        return;
      }

      if (
        !selectedPaymentMethodId ||
        !selectedPaymentType
      ) {
        setErrorMessage(
          'لطفاً یک روش پرداخت معتبر انتخاب کنید.',
        );

        return;
      }

      const cartId =
        Number(
          cart?.cartId ||
            cart?.id,
        );

      if (
        !Number.isFinite(
          cartId,
        ) ||
        cartId <= 0
      ) {
        setErrorMessage(
          'سبد خرید معتبر نیست.',
        );

        return;
      }

      setValidatingCart(
        true,
      );

      try {
        /*
         * ======================================================
         * P0:
         * قبل از ساخت سفارش حتماً Cart روی Backend Validate شود.
         * ======================================================
         */
        const cartIsValid =
          await validateCartBeforeOrder(
            cartId,
          );

        if (!cartIsValid) {
          return;
        }

        const orderData = {
          cartId,

          zipCode:
            selectedAddress
              .postalCode ||
            '',

          phoneNumber:
            selectedAddress
              .phoneNumber ||
            '',

          destinationAddress:
            selectedAddress
              .fullAddress ||
            '',

          recipientName:
            selectedAddress
              .recipientName ||
            '',

          city:
            selectedAddress
              .city ||
            '',

          province:
            selectedAddress
              .province ||
            '',

          shippingMethod,

          /*
           * موقت:
           * در مرحله Payment Contract
           * به paymentMethodId تبدیل می‌شود.
           */
          paymentMethod:
            selectedPaymentType,

          notes:
            orderNotes.trim(),
        };

        const result =
          (await dispatch(
            placeOrderFromCart(
              orderData,
            ),
          ).unwrap()) as {
            orderId?: number;
            id?: number;
            paymentUrl?: string;
          };

        if (
          result?.paymentUrl
        ) {
          window.location.href =
            result.paymentUrl;

          return;
        }

        const orderId =
          result?.orderId ||
          result?.id;

        if (orderId) {
          router.push(
            `/profile/orders/${orderId}/success`,
          );

          return;
        }

        setErrorMessage(
          'پاسخ ثبت سفارش معتبر نیست.',
        );
      } catch (
        error: unknown
      ) {
        setErrorMessage(
          typeof error ===
            'string'
            ? error
            : (
                error instanceof
                Error
              )
              ? error.message
              : 'خطا در ثبت سفارش',
        );
      } finally {
        setValidatingCart(
          false,
        );
      }
    };

  const paymentUnavailable =
    !loadingPaymentMethods &&
    (
      paymentMethods.length ===
        0 ||
      selectedPaymentMethodId ===
        null
    );

  const checkoutBusy =
    actionLoading ||
    validatingCart;

  return (
    <>
      <div
        className={
          styles.sectionHeader
        }
      >
        <h3>
          پرداخت
        </h3>

        <p
          className={
            styles.sectionSubtitle
          }
        >
          لطفاً شیوه پرداخت خود را انتخاب کنید
        </p>
      </div>

      <div
        className={
          styles.step3Container
        }
      >
        <div
          className={
            styles.mainSection
          }
        >
          {selectedAddress && (
            <div
              className={
                styles.selectedAddress
              }
            >
              <h3
                className={
                  styles.sectionTitle
                }
              >
                آدرس ارسال
              </h3>

              <div
                className={
                  styles.addressCard
                }
              >
                <div
                  className={
                    styles.addressHeader
                  }
                >
                  <span
                    className={
                      styles.addressTitle
                    }
                  >
                    {
                      selectedAddress
                        .addressTitle
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.addressDetail
                  }
                >
                  <span
                    className={
                      styles.addressIcon
                    }
                  >
                    📍
                  </span>

                  {
                    selectedAddress
                      .fullAddress
                  }
                </div>

                <div
                  className={
                    styles.addressMeta
                  }
                >
                  <span>
                    👤{' '}
                    {
                      selectedAddress
                        .recipientName
                    }
                  </span>

                  <span>
                    📞{' '}
                    {
                      selectedAddress
                        .phoneNumber
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            className={
              styles.selectedShipping
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              روش ارسال
            </h3>

            <div
              className={
                styles.shippingCard
              }
            >
              <span
                className={
                  styles.shippingIcon
                }
              >
                🚚
              </span>

              <div
                className={
                  styles.shippingInfo
                }
              >
                <span
                  className={
                    styles.shippingLabel
                  }
                >
                  {
                    shippingMethodLabels[
                      shippingMethod
                    ] ||
                    shippingMethod
                  }
                </span>

                <span
                  className={
                    styles.shippingPrice
                  }
                >
                  {formatCurrency(
                    roundedShippingCost,
                  )}{' '}
                  تومان
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              styles.paymentSection
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              شیوه پرداخت
            </h3>

            {loadingPaymentMethods ? (
              <div
                className={
                  styles.loading
                }
              >
                در حال بارگذاری روش‌های پرداخت...
              </div>
            ) : paymentMethodsError ? (
              <div
                className={
                  styles.errorMessage
                }
              >
                <span
                  className={
                    styles.errorIcon
                  }
                >
                  ⚠️
                </span>

                {
                  paymentMethodsError
                }
              </div>
            ) : (
              <div
                className={
                  styles.paymentMethods
                }
              >
                {paymentMethods.map(
                  (method) => (
                    <div
                      key={
                        method
                          .paymentMethodId
                      }
                      className={`${styles.paymentMethod} ${
                        selectedPaymentMethodId ===
                        method.paymentMethodId
                          ? styles.selected
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedPaymentMethodId(
                          method
                            .paymentMethodId,
                        );

                        setSelectedPaymentType(
                          method
                            .methodType,
                        );

                        setErrorMessage(
                          '',
                        );
                      }}
                    >
                      <div
                        className={
                          styles.methodIcon
                        }
                      >
                        {getPaymentIcon(
                          method.methodType,
                        )}
                      </div>

                      <div
                        className={
                          styles.methodInfo
                        }
                      >
                        <div
                          className={
                            styles.methodName
                          }
                        >
                          {
                            method.name
                          }
                        </div>

                        <div
                          className={
                            styles.methodDescription
                          }
                        >
                          {
                            method.description
                          }
                        </div>
                      </div>

                      <div
                        className={
                          styles.radioCircle
                        }
                      >
                        {selectedPaymentMethodId ===
                          method.paymentMethodId && (
                          <div
                            className={
                              styles.radioInner
                            }
                          />
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div
            className={
              styles.couponSection
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              کد تخفیف
            </h3>

            <div
              className={
                styles.couponInputGroup
              }
            >
              <input
                type="text"
                placeholder="کد تخفیف را وارد کنید"
                value={
                  couponCode
                }
                onChange={(
                  event,
                ) => {
                  setCouponCode(
                    event.target
                      .value,
                  );

                  if (
                    errorMessage
                  ) {
                    setErrorMessage(
                      '',
                    );
                  }
                }}
                disabled={
                  couponApplied ||
                  couponLoading
                }
                className={
                  styles.couponInput
                }
              />

              <button
                type="button"
                onClick={() => {
                  void handleApplyCoupon();
                }}
                disabled={
                  couponApplied ||
                  !couponCode.trim() ||
                  couponLoading
                }
                className={
                  styles.couponBtn
                }
              >
                {couponLoading
                  ? 'در حال اعمال...'
                  : couponApplied
                    ? '✓ اعمال شد'
                    : 'اعمال'}
              </button>
            </div>

            {couponMessage && (
              <p
                className={
                  styles.couponSuccess
                }
              >
                {
                  couponMessage
                }
              </p>
            )}
          </div>

          <div
            className={
              styles.descriptionSection
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              توضیحات سفارش
            </h3>

            <textarea
              placeholder="توضیحات تکمیلی خود را اینجا بنویسید..."
              className={
                styles.descriptionInput
              }
              rows={4}
              value={
                orderNotes
              }
              onChange={(
                event,
              ) =>
                setOrderNotes(
                  event.target
                    .value,
                )
              }
            />
          </div>
        </div>

        <div
          className={
            styles.summary
          }
        >
          <div
            className={
              styles.summaryHeader
            }
          >
            <h3>
              جزئیات پرداخت
            </h3>
          </div>

          <div
            className={
              styles.summaryContent
            }
          >
            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                تعداد کالا
              </span>

              <span>
                {itemsCount} عدد
              </span>
            </div>

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                مبلغ کالاها
              </span>

              <span>
                {formatCurrency(
                  cartSubTotal,
                )}{' '}
                تومان
              </span>
            </div>

            {cartDiscountTotal >
              0 && (
              <div
                className={
                  styles.summaryRow
                }
              >
                <span>
                  مجموع تخفیف‌ها
                </span>

                <span
                  className={
                    styles.discount
                  }
                >
                  -
                  {formatCurrency(
                    cartDiscountTotal,
                  )}{' '}
                  تومان
                </span>
              </div>
            )}

            {Number(
              cart?.taxAmount ||
                0,
            ) > 0 && (
              <div
                className={
                  styles.summaryRow
                }
              >
                <span>
                  مالیات
                </span>

                <span>
                  {formatCurrency(
                    roundPrice(
                      Number(
                        cart
                          .taxAmount,
                      ),
                    ),
                  )}{' '}
                  تومان
                </span>
              </div>
            )}

            <div
              className={
                styles.summaryRow
              }
            >
              <span>
                هزینه ارسال
              </span>

              <span>
                {formatCurrency(
                  roundedShippingCost,
                )}{' '}
                تومان
              </span>
            </div>

            <div
              className={
                styles.summaryDivider
              }
            />

            <div
              className={
                styles.summaryRowTotal
              }
            >
              <span>
                مبلغ قابل پرداخت
              </span>

              <span>
                {formatCurrency(
                  finalAmount,
                )}{' '}
                تومان
              </span>
            </div>
          </div>

          {errorMessage && (
            <div
              className={
                styles.errorMessage
              }
            >
              <span
                className={
                  styles.errorIcon
                }
              >
                ⚠️
              </span>

              {errorMessage}
            </div>
          )}

          <div
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.backBtn
              }
              onClick={
                onBack
              }
              disabled={
                checkoutBusy
              }
            >
              بازگشت
            </button>

            <button
              type="button"
              className={
                styles.payBtn
              }
              onClick={() => {
                void handlePayment();
              }}
              disabled={
                checkoutBusy ||
                loadingPaymentMethods ||
                paymentUnavailable
              }
            >
              {validatingCart
                ? 'در حال بررسی سبد خرید...'
                : actionLoading
                  ? 'در حال ثبت سفارش...'
                  : paymentUnavailable
                    ? 'روش پرداخت در دسترس نیست'
                    : 'پرداخت و ثبت نهایی'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartStep3;