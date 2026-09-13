import {
  useCallback,
  useEffect,
  useState,
} from 'react';

export const useHorizontalDragScroll = <T extends HTMLElement>(
  activeClassName?: string,
) => {
  // A callback ref is required because product rows mount after their async
  // data arrives. A one-time effect with useRef would run before the row
  // exists and never attach the drag listeners.
  const [element, setElement] = useState<T | null>(null);
  const elementRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let pointerId: number | null = null;
    let didDrag = false;
    let suppressClickUntil = 0;
    let lastTouchStartAt = 0;

    const finishDrag = () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      if (didDrag) {
        suppressClickUntil = Date.now() + 250;
      }
      didDrag = false;

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
      // On touch devices native overflow scrolling is more reliable than a
      // JS drag handler, especially for RTL rows. Let the browser own it.
      if (event.pointerType !== 'mouse') {
        lastTouchStartAt = Date.now();
        return;
      }

      if (event.button !== 0) {
        return;
      }

      // Only capture the pointer when there is something to scroll. This
      // keeps normal card clicks and links untouched on non-overflowing rows.
      if (element.scrollWidth <= element.clientWidth) {
        return;
      }

      isDragging = true;
      didDrag = false;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = element.scrollLeft;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== pointerId) {
        return;
      }

      const distance = event.clientX - startX;
      if (Math.abs(distance) <= 6) return;

      if (!didDrag) {
        didDrag = true;
        try {
          element.setPointerCapture(event.pointerId);
        } catch {
          // Dragging continues through the window listeners if capture fails.
        }
        if (activeClassName) element.classList.add(activeClassName);
      }

      // Once the pointer has moved past the drag threshold, prevent the
      // browser from selecting card text or starting a native link drag.
      event.preventDefault();

      // Keep the content under the pointer in both LTR and RTL layouts.
      const nextScrollLeft = startScrollLeft - distance * 1.5;
      if (nextScrollLeft !== element.scrollLeft) {
        element.scrollLeft = nextScrollLeft;
      }
    };

    // Mouse events are kept as a fallback for embedded browsers that expose
    // mouse dragging without dispatching PointerEvent updates to the page.
    const handleMouseDown = (event: MouseEvent) => {
      // Chromium usually emits mousedown immediately after pointerdown. Do
      // not let that fallback overwrite an active PointerEvent drag (and its
      // pointerId), otherwise pointermove events are discarded.
      if (
        isDragging ||
        event.button !== 0 ||
        Date.now() - lastTouchStartAt < 500 ||
        element.scrollWidth <= element.clientWidth
      ) {
        return;
      }
      isDragging = true;
      didDrag = false;
      pointerId = null;
      startX = event.clientX;
      startScrollLeft = element.scrollLeft;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || pointerId !== null) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) <= 6) return;
      if (!didDrag) {
        didDrag = true;
        if (activeClassName) element.classList.add(activeClassName);
      }
      event.preventDefault();
      const nextScrollLeft = startScrollLeft - distance * 1.5;
      element.scrollLeft = nextScrollLeft;
    };

    const handleMouseUp = () => {
      if (pointerId === null) finishDrag();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === pointerId) {
        finishDrag();
      }
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (Date.now() > suppressClickUntil) return;
      suppressClickUntil = 0;
      event.preventDefault();
      event.stopPropagation();
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);
    element.addEventListener('mousedown', handleMouseDown);
    // Keep listening on the window as well. This makes a drag continue when
    // the pointer leaves the card row or when a browser declines capture.
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('lostpointercapture', finishDrag);
    element.addEventListener('click', handleClickCapture, true);

    return () => {
      finishDrag();
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('lostpointercapture', finishDrag);
      element.removeEventListener('click', handleClickCapture, true);
    };
  }, [activeClassName, element]);

  return elementRef;
};
