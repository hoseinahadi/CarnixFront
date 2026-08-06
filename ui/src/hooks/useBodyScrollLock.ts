import {
  useEffect,
} from 'react';

import {
  acquireBodyScrollLock,
} from '@/services/ui/overlayStore';

export const useBodyScrollLock = (
  isLocked: boolean,
): void => {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    return acquireBodyScrollLock();
  }, [isLocked]);
};
