"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { debounce, isBrowser } from "@/utils/helpers";

/**
 * Hook for persisting state to localStorage with SSR safety
 *
 * @param key - The localStorage key
 * @param initialValue - Default value if no stored value exists
 * @param debounceMs - Debounce delay for writes (default: 300ms)
 * @returns [value, setValue, { isLoading, error }]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 300
): [T, (value: T | ((prev: T) => T)) => void, { isLoading: boolean; error: string | null }] {
  // SSR-safe: Start with initial value, hydrate on client
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isBrowser()) {
      setIsLoading(false);
      return;
    }

    const result = getStorageItem<T>(key);
    if (result.success) {
      if (result.data !== null) {
        setStoredValue(result.data);
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, [key]);

  // Debounced save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((value: T) => {
      if (!isBrowser()) return;

      const result = setStorageItem(key, value);
      if (!result.success) {
        setError(result.message);
        if (result.error === "QUOTA_EXCEEDED") {
          console.error(
            `localStorage quota exceeded for key "${key}". Consider clearing old data.`
          );
        }
      } else {
        setError(null);
      }
    }, debounceMs),
    [key, debounceMs]
  );

  // setValue function that updates state and triggers debounced save
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        debouncedSave(newValue);
        return newValue;
      });
    },
    [debouncedSave]
  );

  return [storedValue, setValue, { isLoading, error }];
}

export default useLocalStorage;
