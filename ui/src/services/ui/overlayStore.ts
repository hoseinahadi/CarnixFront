type Listener = () => void;

const modalListeners = new Set<Listener>();
let openModalCount = 0;

const emitModalChange = (): void => {
  modalListeners.forEach((listener) => {
    listener();
  });
};

export const acquireModal = (): (() => void) => {
  openModalCount += 1;
  emitModalChange();

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    openModalCount = Math.max(0, openModalCount - 1);
    emitModalChange();
  };
};

export const subscribeToModalState = (
  listener: Listener,
): (() => void) => {
  modalListeners.add(listener);

  return () => {
    modalListeners.delete(listener);
  };
};

export const getModalStateSnapshot = (): boolean =>
  openModalCount > 0;

export const getModalStateServerSnapshot = (): boolean => false;

let bodyLockCount = 0;
let previousBodyOverflow: string | null = null;

export const acquireBodyScrollLock = (): (() => void) => {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  bodyLockCount += 1;
  let released = false;

  return () => {
    if (released || typeof document === 'undefined') {
      return;
    }

    released = true;
    bodyLockCount = Math.max(0, bodyLockCount - 1);

    if (bodyLockCount === 0) {
      document.body.style.overflow =
        previousBodyOverflow ?? '';
      previousBodyOverflow = null;
    }
  };
};
