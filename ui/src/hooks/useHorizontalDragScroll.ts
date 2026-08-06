import {
  useEffect,
  useRef,
} from 'react';

export const useHorizontalDragScroll = <T extends HTMLElement>(
  activeClassName?: string,
) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let pointerId: number | null = null;

    const finishDrag = () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (activeClassName) {
        element.classList.remove(activeClassName);
      }

      if (
        pointerId !== null &&
        element.hasPointerCapture(pointerId)
      ) {
        element.releasePointerCapture(pointerId);
      }

      pointerId = null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      isDragging = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = element.scrollLeft;
      element.setPointerCapture(event.pointerId);

      if (activeClassName) {
        element.classList.add(activeClassName);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== pointerId) {
        return;
      }

      const distance = event.clientX - startX;
      element.scrollLeft = startScrollLeft - distance * 1.5;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === pointerId) {
        finishDrag();
      }
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('lostpointercapture', finishDrag);

    return () => {
      finishDrag();
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('lostpointercapture', finishDrag);
    };
  }, [activeClassName]);

  return elementRef;
};
