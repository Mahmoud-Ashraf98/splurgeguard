import { useCallback, useEffect, useRef } from "react";

/**
 * Accelerating long-press hook.
 * - Fires callback once immediately on press.
 * - After 400ms, starts repeating; tick interval shortens over time, capped at 40ms.
 * - Cleans up on release, leave, cancel, and unmount.
 *
 * Consumers should use functional state updates inside `callback` to avoid stale closures.
 */
export function useLongPress(callback: () => void) {
  const cbRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clear(), [clear]);

  const start = useCallback(() => {
    clear();
    // Fire once immediately
    cbRef.current();

    timeoutRef.current = setTimeout(() => {
      let delay = 150;
      const tick = () => {
        cbRef.current();
        delay = Math.max(40, Math.floor(delay * 0.85));
        intervalRef.current = setTimeout(tick, delay);
      };
      intervalRef.current = setTimeout(tick, delay);
    }, 400);
  }, [clear]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}
