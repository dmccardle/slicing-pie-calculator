"use client";

import { useLocalStorage } from "./useLocalStorage";

/**
 * User preferences for enabled features (stored in localStorage)
 */
export interface FeaturePreferences {
  vestingEnabled: boolean;
  valuationEnabled: boolean;
}

const FEATURE_PREFERENCES_KEY = "slicingPie_featurePreferences";

const DEFAULT_PREFERENCES: FeaturePreferences = {
  vestingEnabled: true, // Default to enabled if feature is available
  valuationEnabled: true, // Default to enabled if feature is available
};

/**
 * Check if vesting feature is available in this tier/deployment
 * Controlled by environment variable - user cannot override this
 * Note: NEXT_PUBLIC_* env vars are inlined at build time and available on both server and client
 */
function isVestingAvailable(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_VESTING === "true";
}

/**
 * Check if valuation feature is available in this tier/deployment
 * Controlled by environment variable - user cannot override this
 * Note: NEXT_PUBLIC_* env vars are inlined at build time and available on both server and client
 */
function isValuationAvailable(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_VALUATION === "true";
}

/**
 * Hook for managing feature flags with proper separation of concerns:
 *
 * - *Available: Is the feature available in this tier? (env var controlled, user cannot change)
 * - *Enabled: Has the user enabled this feature? (localStorage, user preference)
 *
 * For UI logic:
 * - Show toggle card only if feature is Available
 * - Show feature UI only if Available AND Enabled
 */
export function useFeatureFlags() {
  // Feature availability (tier-controlled, read-only)
  const vestingAvailable = isVestingAvailable();
  const valuationAvailable = isValuationAvailable();

  // User preferences (localStorage)
  const [preferences, setPreferences, { isLoading }] = useLocalStorage<FeaturePreferences>(
    FEATURE_PREFERENCES_KEY,
    DEFAULT_PREFERENCES
  );

  // Setters for user preferences
  const setVestingEnabled = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, vestingEnabled: enabled }));
  };

  const setValuationEnabled = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, valuationEnabled: enabled }));
  };

  return {
    // Feature availability (tier-controlled)
    vestingAvailable,
    valuationAvailable,

    // User preferences (only meaningful if feature is available)
    vestingEnabled: preferences.vestingEnabled,
    valuationEnabled: preferences.valuationEnabled,

    // Convenience: is the feature both available AND enabled?
    vestingActive: vestingAvailable && preferences.vestingEnabled,
    valuationActive: valuationAvailable && preferences.valuationEnabled,

    // Setters
    setVestingEnabled,
    setValuationEnabled,

    isLoading,
  };
}

export default useFeatureFlags;
