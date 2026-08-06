import {
  setAuthFailureCallback,
} from '@/services/api/common/axiosClient';

import {
  clearAuthStorage,
} from '@/services/api/common/authTokenStorage';

import {
  sessionCleared,
} from '@/store/actions/sessionActions';

interface AuthListenerStore {
  dispatch: (
    action: ReturnType<typeof sessionCleared>,
  ) => unknown;
}

/**
 * Listener خطای احراز هویت را به Redux متصل می‌کند.
 *
 * مقدار بازگشتی حتماً باید در Cleanup کامپوننت Provider اجرا شود؛
 * در غیر این صورت HMR و Remount شدن Provider باعث انباشته‌شدن
 * Callbackها و نگه‌داشتن Storeهای قدیمی در حافظه می‌شود.
 */
export const setupAuthListener = (
  store: AuthListenerStore,
): (() => void) => {
  return setAuthFailureCallback(() => {
    clearAuthStorage();
    store.dispatch(sessionCleared());

    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname === '/login') {
      return;
    }

    const callbackUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );

    window.location.assign(
      `/login?callbackUrl=${callbackUrl}`,
    );
  });
};
