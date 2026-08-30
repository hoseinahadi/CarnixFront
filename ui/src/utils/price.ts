/**
 * قوانین نمایش قیمت در فرانت:
 * - همه مبلغ‌ها به نزدیک‌ترین ۱۰۰٬۰۰۰ تومان گرد می‌شوند.
 * - مالیات در جمع‌های سمت فرانت لحاظ نمی‌شود.
 */
export const PRICE_ROUNDING_STEP = 100_000;

export const roundPrice = (value: number | null | undefined): number => {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(numericValue / PRICE_ROUNDING_STEP) * PRICE_ROUNDING_STEP,
  );
};

export const formatPrice = (value: number | null | undefined): string =>
  new Intl.NumberFormat('fa-IR').format(roundPrice(value));


export const calculateRoundedCartSubtotal = (cart: any): number => {
  if (Array.isArray(cart?.items) && cart.items.length > 0) {
    return cart.items.reduce((sum: number, item: any) => {
      const unitPrice = roundPrice(item?.unitPrice ?? item?.price ?? 0);
      const quantity = Math.max(0, Number(item?.quantity ?? 0));
      return sum + unitPrice * quantity;
    }, 0);
  }

  return roundPrice(cart?.subTotal ?? cart?.totalAmount ?? 0);
};

export const calculateRoundedCartDiscount = (cart: any): number =>
  roundPrice(cart?.totalDiscount ?? 0);

export const calculateTaxFreeCartTotal = (cart: any): number => {
  const subTotal = calculateRoundedCartSubtotal(cart);
  const discount = calculateRoundedCartDiscount(cart);

  return Math.max(0, subTotal - discount);
};

export const calculateTaxFreeOrderTotal = (order: any): number => {
  const hasSubtotal = Number.isFinite(Number(order?.subtotal));

  if (hasSubtotal) {
    const subtotal = roundPrice(order?.subtotal ?? 0);
    const discount = roundPrice(order?.discountTotal ?? 0);
    const shipping = Array.isArray(order?.shipments)
      ? order.shipments.reduce(
          (sum: number, shipment: any) => sum + roundPrice(shipment?.shippingCost ?? 0),
          0,
        )
      : 0;

    return Math.max(0, subtotal - discount + shipping);
  }

  // fallback برای پاسخ‌های قدیمی API که فقط grandTotal/taxTotal دارند.
  return roundPrice((order?.grandTotal ?? 0) - (order?.taxTotal ?? 0));
};
