"use client";

import React, { createContext, useContext } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

/**
 * Feature flags context value type
 *
 * - *Available: Is the feature available in this tier? (env var controlled)
 * - *Enabled: Has the user enabled this feature? (user preference)
 * - *Active: Is the feature both available AND enabled?
 */
interface FeatureFlagsContextValue {
  // Vesting feature
  vestingAvailable: boolean;
  vestingEnabled: boolean;
  vestingActive: boolean;
  setVestingEnabled: (enabled: boolean) => void;

  // Valuation feature
  valuationAvailable: boolean;
  valuationEnabled: boolean;
  valuationActive: boolean;
  setValuationEnabled: (enabled: boolean) => void;

  isLoading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

/**
 * Feature flags context provider
 */
export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    vestingAvailable,
    vestingEnabled,
    vestingActive,
    setVestingEnabled,
    valuationAvailable,
    valuationEnabled,
    valuationActive,
    setValuationEnabled,
    isLoading,
  } = useFeatureFlags();

  return (
    <FeatureFlagsContext.Provider
      value={{
        vestingAvailable,
        vestingEnabled,
        vestingActive,
        setVestingEnabled,
        valuationAvailable,
        valuationEnabled,
        valuationActive,
        setValuationEnabled,
        isLoading,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to access feature flags context
 */
export function useFeatureFlagsContext(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider"
    );
  }
  return context;
}

export default FeatureFlagsContext;
