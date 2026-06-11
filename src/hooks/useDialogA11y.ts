import { useEffect, useRef } from "react";

/**
 * Shared dialog accessibility behavior:
 * - focuses the dialog element when opened
 * - closes on Escape
 * - restores focus to the previously focused element on close/unmount
 *
 * Attach the returned ref to the dialog container (give it tabIndex={-1},
 * role="dialog" and aria-modal="true").
 *
 * Uses the latest-callback ref pattern so an inline `onClose` prop does not
 * re-run the effect (which would steal focus from inputs) on parent re-renders.
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  return ref;
}
