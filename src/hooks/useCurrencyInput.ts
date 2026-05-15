import { useState, useCallback, useRef, useEffect, type ChangeEvent } from "react";

/**
 * Manages a currency input field without cursor-jump bugs.
 *
 * Strategy:
 *  - While focused: show raw digit string (no formatting, no cursor issues)
 *  - On blur: format with vi-VN locale dots (1.000.000)
 *  - Exposes `displayValue`, `handleChange`, `handleFocus`, `handleBlur`
 *  - `numericValue` is always the clean integer for use in state/calculations
 */
export function useCurrencyInput(externalValue: number, onCommit: (newValue: number) => void) {
  const isFocused = useRef(false);
  const [rawString, setRawString] = useState(externalValue > 0 ? String(externalValue) : "");

  // Sync if external value changes while NOT focused (e.g., import/reset)
  useEffect(() => {
    if (!isFocused.current) {
      setRawString(externalValue > 0 ? String(externalValue) : "");
    }
  }, [externalValue]);

  const numericValue = rawString ? Math.floor(Number(rawString)) || 0 : 0;

  // What the <input value="..."> shows
  const displayValue = isFocused.current
    ? rawString // raw while typing — no cursor jump
    : externalValue > 0
      ? new Intl.NumberFormat("vi-VN").format(externalValue) // formatted on blur
      : "";

  // Human-readable badge: 15M, 750K, etc.
  const humanBadge = (() => {
    if (externalValue >= 1_000_000) {
      const m = externalValue / 1_000_000;
      return (Number.isInteger(m) ? m : m.toFixed(1)) + "M";
    }
    if (externalValue >= 1_000) {
      const k = externalValue / 1_000;
      return (Number.isInteger(k) ? k : k.toFixed(1)) + "K";
    }
    return null;
  })();

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    // Show raw digits when user taps in — no dots
    setRawString(externalValue > 0 ? String(externalValue) : "");
  }, [externalValue]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setRawString(digits);
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    const num = rawString ? Math.floor(Number(rawString)) || 0 : 0;
    onCommit(num);
    // Trigger re-render so useEffect above fires and formats
    setRawString(externalValue > 0 ? String(externalValue) : "");
  }, [rawString, onCommit, externalValue]);

  return { displayValue, numericValue, humanBadge, handleFocus, handleChange, handleBlur };
}
