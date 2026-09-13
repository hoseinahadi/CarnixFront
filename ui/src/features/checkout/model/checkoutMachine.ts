export type CheckoutStep = 1 | 2 | 3;

export interface CheckoutState {
  step: CheckoutStep;
  cartId: number | null;
  addressId: number | null;
  shippingMethod: string;
  shippingCost: number | null;
  quoteFingerprint: string | null;
}

export type CheckoutEvent =
  | { type: 'CART_READY'; cartId: number }
  | { type: 'GO_TO_CART' }
  | { type: 'GO_TO_DELIVERY' }
  | { type: 'DELIVERY_CONFIRMED'; addressId: number; shippingMethod: string; shippingCost: number; quoteFingerprint: string }
  | { type: 'RESTORE'; state: CheckoutState }
  | { type: 'RESET' };

export const initialCheckoutState: CheckoutState = {
  step: 1,
  cartId: null,
  addressId: null,
  shippingMethod: '',
  shippingCost: null,
  quoteFingerprint: null,
};

export const checkoutReducer = (state: CheckoutState, event: CheckoutEvent): CheckoutState => {
  switch (event.type) {
    case 'CART_READY':
      return state.cartId === event.cartId ? state : { ...initialCheckoutState, cartId: event.cartId };
    case 'GO_TO_CART':
      return { ...state, step: 1 };
    case 'GO_TO_DELIVERY':
      return state.cartId ? { ...state, step: 2 } : state;
    case 'DELIVERY_CONFIRMED':
      return state.cartId ? { ...state, step: 3, addressId: event.addressId, shippingMethod: event.shippingMethod, shippingCost: event.shippingCost, quoteFingerprint: event.quoteFingerprint } : state;
    case 'RESTORE':
      // A persisted quote is never trusted after a reload; delivery is quoted again.
      return event.state.step === 3 ? { ...event.state, step: 2, shippingCost: null, quoteFingerprint: null } : event.state;
    case 'RESET':
      return initialCheckoutState;
  }
};

export const createQuoteFingerprint = (cartId: number, addressId: number, shippingMethod: string, shippingCost: number): string =>
  [cartId, addressId, shippingMethod.trim().toLowerCase(), shippingCost].join(':');

export const isRestorableCheckoutState = (value: unknown, cartId: number): value is CheckoutState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<CheckoutState>;
  return state.cartId === cartId && [1, 2, 3].includes(Number(state.step));
};
