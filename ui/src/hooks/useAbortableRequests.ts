import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

interface TrackedAbortController {
  controller: AbortController;
  release: () => void;
}

/**
 * تمام Requestهای ساخته‌شده توسط یک کامپوننت را در Unmount لغو می‌کند.
 */
export const useAbortableRequests = () => {
  const controllersRef = useRef(
    new Set<AbortController>(),
  );

  useEffect(() => {
    const controllers = controllersRef.current;

    return () => {
      controllers.forEach((controller) => {
        controller.abort();
      });
      controllers.clear();
    };
  }, []);

  return useCallback((): TrackedAbortController => {
    const controller = new AbortController();
    controllersRef.current.add(controller);

    let released = false;

    return {
      controller,
      release: () => {
        if (released) {
          return;
        }

        released = true;
        controllersRef.current.delete(controller);
      },
    };
  }, []);
};
