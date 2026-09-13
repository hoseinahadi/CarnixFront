'use client';

import { useEffect, useReducer, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkoutReducer, initialCheckoutState, isRestorableCheckoutState } from '@/features/checkout/model/checkoutMachine';

const STORAGE_KEY = 'carnix:checkout:v1';

export const useCheckoutMachine = (cartId: number | null) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedStep = Number(searchParams.get('step'));
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);
  const handledRequestedStepRef = useRef<number | null>(null);
  const initializedCartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!cartId) return;
    if (initializedCartRef.current === cartId) return;

    initializedCartRef.current = cartId;
    // Opening /cart is always the cart step. A persisted delivery/payment
    // state is restored only when the URL explicitly asks for that step.
    if (requestedStep !== 2 && requestedStep !== 3) {
      sessionStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'CART_READY', cartId });
      return;
    }

    const serialized = sessionStorage.getItem(STORAGE_KEY);
    if (serialized) {
      try {
        const restored: unknown = JSON.parse(serialized);
        if (isRestorableCheckoutState(restored, cartId)) {
          dispatch({ type: 'RESTORE', state: restored });
          return;
        }
      } catch { sessionStorage.removeItem(STORAGE_KEY); }
    }
    dispatch({ type: 'CART_READY', cartId });
  }, [cartId, requestedStep]);

  useEffect(() => {
    if (!state.cartId) return;

    if (handledRequestedStepRef.current !== requestedStep) {
      handledRequestedStepRef.current = null;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!Number.isFinite(requestedStep)) {
      return;
    }

    // The login callback may intentionally open step 2. Handle that URL
    // request once; after the user goes back, sync the URL to step 1 instead
    // of immediately sending them forward again.
    if (requestedStep === 2 && state.step === 1 && handledRequestedStepRef.current !== requestedStep) {
      handledRequestedStepRef.current = requestedStep;
      dispatch({ type: 'GO_TO_DELIVERY' });
      return;
    }

    handledRequestedStepRef.current = requestedStep;
    if (requestedStep !== state.step) router.replace(`/cart?step=${state.step}`, { scroll: false });
  }, [dispatch, requestedStep, router, state]);

  useEffect(() => {
    const restoreFromHistory = () => {
      const requested = Number(new URLSearchParams(window.location.search).get('step'));
      if (requested === 1) dispatch({ type: 'GO_TO_CART' });
      if (requested === 2) dispatch({ type: 'GO_TO_DELIVERY' });
    };
    window.addEventListener('popstate', restoreFromHistory);
    return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);

  return { state, dispatch };
};
