"use client";

import { useLocalStorage } from "./useLocalStorage";

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  vestingEnabled: boolean;
  valuationEnabled: boolean;
}

const FEATURE_FLAGS_KEY = "slicingPie_featureFlags";

/**
 * Get default value for vesting enabled from environment variable
 * Falls back to false if not set
 */
function getDefaultVestingEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const envValue = process.env.NEXT_PUBLIC_VESTING_ENABLED;
  return envValue === "true";
}

/**
 * Get default value for valuation enabled from environment variable
 * Falls back to false if not set
 */
function getDefaultValuationEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const envValue = process.env.NEXT_PUBLIC_VALUATION_ENABLED;
  return envValue === "true";
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  vestingEnabled: false, // Will be overridden by env var check
  valuationEnabled: false, // Will be overridden by env var check
};

/**
 * Hook for managing feature flags with localStorage persistence
 * Environment variable takes precedence for initial default value
 */
export function useFeatureFlags() {
  // Get initial value considering env vars
  const initialFlags: FeatureFlags = {
    ...DEFAULT_FEATURE_FLAGS,
    vestingEnabled: getDefaultVestingEnabled(),
    valuationEnabled: getDefaultValuationEnabled(),
  };

  const [flags, setFlags, { isLoading }] = useLocalStorage<FeatureFlags>(
    FEATURE_FLAGS_KEY,
    initialFlags
  );

  const setVestingEnabled = (enabled: boolean) => {
    setFlags((prev) => ({ ...prev, vestingEnabled: enabled }));
  };

  const setValuationEnabled = (enabled: boolean) => {
    setFlags((prev) => ({ ...prev, valuationEnabled: enabled }));
  };

  return {
    vestingEnabled: flags.vestingEnabled,
    setVestingEnabled,
    valuationEnabled: flags.valuationEnabled,
    setValuationEnabled,
    isLoading,
  };
}

export default useFeatureFlags;
