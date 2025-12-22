"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AppSettings } from "@/types";
import { DEFAULT_APP_SETTINGS } from "@/types";

/**
 * App context value type
 */
interface AppContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * App context provider
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings, { isLoading }] = useLocalStorage<AppSettings>(
    "app-settings",
    DEFAULT_APP_SETTINGS
  );

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_APP_SETTINGS);
  }, [setSettings]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      isLoading,
    }),
    [settings, updateSettings, resetSettings, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access app context
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
