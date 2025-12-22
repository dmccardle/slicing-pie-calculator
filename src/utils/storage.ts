/**
 * localStorage wrapper with error handling
 */

import { isBrowser } from "./helpers";

/**
 * Storage error types
 */
export type StorageError =
  | "QUOTA_EXCEEDED"
  | "NOT_AVAILABLE"
  | "PARSE_ERROR"
  | "UNKNOWN";

/**
 * Storage result type
 */
export type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: StorageError; message: string };

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (!isBrowser()) return false;

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string): StorageResult<T | null> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "NOT_AVAILABLE",
      message: "localStorage is not available",
    };
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return { success: true, data: null };
    }
    const parsed = JSON.parse(item) as T;
    return { success: true, data: parsed };
  } catch (e) {
    return {
      success: false,
      error: "PARSE_ERROR",
      message: `Failed to parse stored value: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

/**
 * Set item in localStorage with error handling
 */
export function setStorageItem<T>(key: string, value: T): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "NOT_AVAILABLE",
      message: "localStorage is not available",
    };
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return { success: true, data: undefined };
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      return {
        success: false,
        error: "QUOTA_EXCEEDED",
        message: "localStorage quota exceeded",
      };
    }
    return {
      success: false,
      error: "UNKNOWN",
      message: `Failed to store value: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "NOT_AVAILABLE",
      message: "localStorage is not available",
    };
  }

  try {
    localStorage.removeItem(key);
    return { success: true, data: undefined };
  } catch (e) {
    return {
      success: false,
      error: "UNKNOWN",
      message: `Failed to remove value: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

/**
 * Clear all localStorage data
 */
export function clearStorage(): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "NOT_AVAILABLE",
      message: "localStorage is not available",
    };
  }

  try {
    localStorage.clear();
    return { success: true, data: undefined };
  } catch (e) {
    return {
      success: false,
      error: "UNKNOWN",
      message: `Failed to clear storage: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

/**
 * Get all keys in localStorage
 */
export function getStorageKeys(): StorageResult<string[]> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "NOT_AVAILABLE",
      message: "localStorage is not available",
    };
  }

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return { success: true, data: keys };
  } catch (e) {
    return {
      success: false,
      error: "UNKNOWN",
      message: `Failed to get storage keys: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}
