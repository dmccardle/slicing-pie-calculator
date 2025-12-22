"use client";

import React, { createContext, useContext } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

/**
 * Feature flags context value type
 */
interface FeatureFlagsContextValue {
  vestingEnabled: boolean;
  setVestingEnabled: (enabled: boolean) => void;
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
  const { vestingEnabled, setVestingEnabled, isLoading } = useFeatureFlags();

  return (
    <FeatureFlagsContext.Provider
      value={{ vestingEnabled, setVestingEnabled, isLoading }}
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
