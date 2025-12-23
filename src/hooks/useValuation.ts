"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type {
  ValuationConfig,
  ValuationHistoryEntry,
  BusinessMetrics,
  ValuationMode,
} from "@/types/valuation";
import {
  DEFAULT_VALUATION_CONFIG,
  MAX_HISTORY_ENTRIES,
} from "@/types/valuation";
import { calculateValuation, getCurrentValuation } from "@/utils/valuation";

const VALUATION_CONFIG_KEY = "slicingPie_valuationConfig";
const VALUATION_HISTORY_KEY = "slicingPie_valuationHistory";

/**
 * Generate a unique ID for history entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing valuation configuration with localStorage persistence
 */
export function useValuation() {
  const [config, setConfig, { isLoading: configLoading }] =
    useLocalStorage<ValuationConfig>(VALUATION_CONFIG_KEY, DEFAULT_VALUATION_CONFIG);

  const [history, setHistory, { isLoading: historyLoading }] =
    useLocalStorage<ValuationHistoryEntry[]>(VALUATION_HISTORY_KEY, []);

  const isLoading = configLoading || historyLoading;

  // ============================================================================
  // Config Setters
  // ============================================================================

  /**
   * Set the valuation mode (manual or auto)
   */
  const setMode = useCallback(
    (mode: ValuationMode) => {
      setConfig((prev) => ({
        ...prev,
        mode,
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setConfig]
  );

  /**
   * Set manual valuation value (in cents)
   */
  const setManualValue = useCallback(
    (value: number | null) => {
      setConfig((prev) => ({
        ...prev,
        manualValue: value,
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setConfig]
  );

  /**
   * Set business metrics for auto-calculation
   */
  const setBusinessMetrics = useCallback(
    (metrics: BusinessMetrics | null) => {
      setConfig((prev) => ({
        ...prev,
        businessMetrics: metrics,
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setConfig]
  );

  /**
   * Set disclaimer acknowledged flag
   */
  const setDisclaimerAcknowledged = useCallback(
    (acknowledged: boolean) => {
      setConfig((prev) => ({
        ...prev,
        disclaimerAcknowledged: acknowledged,
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setConfig]
  );

  /**
   * Save the current configuration and add to history
   */
  const saveValuation = useCallback(() => {
    const currentValue = getCurrentValuation(
      config.mode,
      config.manualValue,
      config.businessMetrics
    );

    if (currentValue === null) {
      return false;
    }

    // Create history entry
    const entry: ValuationHistoryEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      mode: config.mode,
      value: currentValue,
      manualValue: config.manualValue,
      businessMetrics: config.businessMetrics,
    };

    // Add to history with FIFO eviction
    setHistory((prev) => {
      const newHistory = [entry, ...prev];
      if (newHistory.length > MAX_HISTORY_ENTRIES) {
        return newHistory.slice(0, MAX_HISTORY_ENTRIES);
      }
      return newHistory;
    });

    // Update lastUpdated
    setConfig((prev) => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
    }));

    return true;
  }, [config, setConfig, setHistory]);

  // ============================================================================
  // History Management
  // ============================================================================

  /**
   * Get valuation history
   */
  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  /**
   * Restore configuration from a history entry
   */
  const restoreFromHistory = useCallback(
    (entryId: string) => {
      const entry = history.find((e) => e.id === entryId);
      if (!entry) return false;

      setConfig((prev) => ({
        ...prev,
        mode: entry.mode,
        manualValue: entry.manualValue,
        businessMetrics: entry.businessMetrics,
        lastUpdated: new Date().toISOString(),
      }));

      return true;
    },
    [history, setConfig]
  );

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  /**
   * Import valuation data (for bulk restore from backup)
   */
  const importValuationData = useCallback(
    (data: { config?: ValuationConfig; history?: ValuationHistoryEntry[] }) => {
      if (data.config) {
        setConfig(data.config);
      }
      if (data.history) {
        setHistory(data.history);
      }
    },
    [setConfig, setHistory]
  );

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Get the current valuation value (computed)
   */
  const currentValuation = getCurrentValuation(
    config.mode,
    config.manualValue,
    config.businessMetrics
  );

  /**
   * Get calculation result with breakdown (for auto mode)
   */
  const calculationResult =
    config.mode === "auto" && config.businessMetrics
      ? calculateValuation(config.businessMetrics)
      : null;

  /**
   * Check if valuation is configured and ready
   */
  const isValuationSet = currentValuation !== null && currentValuation > 0;

  return {
    // Config state
    config,
    isLoading,

    // Current values
    currentValuation,
    calculationResult,
    isValuationSet,

    // Config setters
    setMode,
    setManualValue,
    setBusinessMetrics,
    setDisclaimerAcknowledged,
    saveValuation,

    // History
    history,
    getHistory,
    restoreFromHistory,
    clearHistory,

    // Import
    importValuationData,
  };
}

export default useValuation;
