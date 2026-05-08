import { useRef, useCallback, useEffect } from "react";

/**
 * Tiered "Gear Shifting" long-press hook.
 * - Gear 1: immediate single tap (multiplier 1)
 * - Gear 2: 500ms pause before auto-repeat starts
 * - Gear 3: cruising — 200ms ticks, multiplier 1
 * - Gear 4: highway (after ~1.5s) — 50ms ticks, multiplier 1
 * - Gear 5: hyper-drive (after ~3s) — 50ms ticks, multiplier 10
 *
 * Uses a savedCallback ref to avoid stale closures across rapid re-renders.
 */
export function useLongPress(callback: (multiplier: number) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);
  const isPressed = useRef(false);

  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    isPressed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback((e?: React.SyntheticEvent) => {
    // Prevent mobile text selection / magnifier on touch
    if (e && e.type !== "mousedown") {
      try {
        e.preventDefault();
      } catch {
        /* passive listener — ignore */
      }
    }

    if (isPressed.current) return;
    isPressed.current = true;
    tickRef.current = 0;

    // GEAR 1: immediate
    savedCallback.current(1);

    const loop = () => {
      if (!isPressed.current) return;
      tickRef.current += 1;

      let delay = 200; // GEAR 3: cruising
      let multiplier = 1;

      if (tickRef.current > 25) {
        // GEAR 5: hyper-drive
        delay = 50;
        multiplier = 10;
      } else if (tickRef.current > 5) {
        // GEAR 4: highway
        delay = 50;
        multiplier = 1;
      }

      savedCallback.current(multiplier);
      timeoutRef.current = setTimeout(loop, delay);
    };

    // GEAR 2: pause
    timeoutRef.current = setTimeout(loop, 500);
  }, []);

  useEffect(() => stop, [stop]);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: stop,
  };
}
