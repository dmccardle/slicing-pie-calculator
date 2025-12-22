"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { AIModel } from "@/types/ai";

interface AIPreferences {
  modelPreference: AIModel;
}

const AI_PREFERENCES_KEY = "slicingPie_aiPreferences";

const DEFAULT_AI_PREFERENCES: AIPreferences = {
  modelPreference: "claude-3-haiku-20240307",
};

/**
 * Hook for managing AI settings
 * API key comes from environment variable (NEXT_PUBLIC_ANTHROPIC_API_KEY)
 * Model preference is stored in localStorage
 */
export function useAISettings() {
  const [preferences, setPreferences, { isLoading, error }] = useLocalStorage<AIPreferences>(
    AI_PREFERENCES_KEY,
    DEFAULT_AI_PREFERENCES
  );

  // API key from environment variable - more secure than localStorage
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || null;

  /**
   * Set the preferred model
   */
  const setModelPreference = useCallback(
    (model: AIModel) => {
      setPreferences((prev) => ({ ...prev, modelPreference: model }));
    },
    [setPreferences]
  );

  /**
   * Reset model preference to default
   */
  const clearSettings = useCallback(() => {
    setPreferences(DEFAULT_AI_PREFERENCES);
  }, [setPreferences]);

  /**
   * Check if AI is configured (has API key in env)
   */
  const isConfigured = !!apiKey;

  return {
    // Settings
    apiKey,
    modelPreference: preferences.modelPreference,

    // State
    isConfigured,
    isLoading,
    error,

    // Actions
    setModelPreference,
    clearSettings,
  };
}

export default useAISettings;
