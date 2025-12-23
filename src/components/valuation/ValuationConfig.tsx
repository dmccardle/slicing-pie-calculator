"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Input } from "@/components/ui";
import { useValuation } from "@/hooks/useValuation";
import { ValuationDisclaimer, DisclaimerModal } from "./ValuationDisclaimer";
import { BusinessMetricsForm } from "./BusinessMetricsForm";
import {
  formatCurrency,
  formatCompactNumber,
  parseCurrencyInput,
  centsToDollars,
} from "@/utils/valuation";
import type { ValuationMode } from "@/types/valuation";

interface ValuationConfigProps {
  onSave?: () => void;
  showHeader?: boolean;
}

export function ValuationConfig({ onSave, showHeader = true }: ValuationConfigProps) {
  const {
    config,
    currentValuation,
    isLoading,
    setMode,
    setManualValue,
    setDisclaimerAcknowledged,
    saveValuation,
  } = useValuation();

  // Local state for the input field (in dollars for display)
  const [inputValue, setInputValue] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  // Initialize input value from config
  useEffect(() => {
    if (config.manualValue !== null) {
      setInputValue(centsToDollars(config.manualValue).toString());
    } else {
      setInputValue("");
    }
  }, [config.manualValue]);

  const handleModeChange = useCallback(
    (newMode: ValuationMode) => {
      setMode(newMode);
      setHasChanges(true);
      setInputError(null);
    },
    [setMode]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setInputError(null);
      setHasChanges(true);

      // Parse and validate
      if (value.trim() === "") {
        setManualValue(null);
        return;
      }

      const cents = parseCurrencyInput(value);
      if (cents === null) {
        setInputError("Please enter a valid number");
        return;
      }

      if (cents <= 0) {
        setInputError("Valuation must be a positive amount");
        return;
      }

      setManualValue(cents);
    },
    [setManualValue]
  );

  // Perform the actual save
  const performSave = useCallback(() => {
    const success = saveValuation();
    if (success) {
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSave?.();
    }
  }, [saveValuation, onSave]);

  // Handle disclaimer modal acceptance
  const handleDisclaimerAccept = useCallback(() => {
    setDisclaimerAcknowledged(true);
    setShowDisclaimerModal(false);
    performSave();
  }, [setDisclaimerAcknowledged, performSave]);

  const handleSave = useCallback(() => {
    // Validate manual mode
    if (config.mode === "manual") {
      if (config.manualValue === null) {
        setInputError("Please enter a valuation amount");
        return;
      }
      if (config.manualValue <= 0) {
        setInputError("Valuation must be a positive amount");
        return;
      }
    }

    // Validate auto mode
    if (config.mode === "auto") {
      if (!config.businessMetrics || config.businessMetrics.currentYearProfit <= 0) {
        setInputError("Please enter current year profit");
        return;
      }
    }

    // Show disclaimer modal if not yet acknowledged
    if (!config.disclaimerAcknowledged) {
      setShowDisclaimerModal(true);
      return;
    }

    performSave();
  }, [config.mode, config.manualValue, config.businessMetrics, config.disclaimerAcknowledged, performSave]);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Company Valuation
          </h2>
        </CardHeader>
      )}
      <CardBody className="space-y-6">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valuation Method
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("manual")}
              className={`
                flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors
                ${
                  config.mode === "manual"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div className="text-left">
                <div className="font-medium">Manual Entry</div>
                <div className="text-xs opacity-75">
                  Set your own valuation amount
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("auto")}
              className={`
                flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors
                ${
                  config.mode === "auto"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div className="text-left">
                <div className="font-medium">Auto-Calculated</div>
                <div className="text-xs opacity-75">
                  Based on business metrics
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Value Input */}
        {config.mode === "manual" && (
          <div className="space-y-2">
            <Input
              label="Company Valuation"
              type="text"
              inputMode="decimal"
              placeholder="e.g., 500000 or $500K or $1.5M"
              value={inputValue}
              onChange={handleInputChange}
              error={inputError || undefined}
              helperText="Enter the total company valuation in dollars"
            />

            {config.manualValue !== null && config.manualValue > 0 && !inputError && (
              <div className="text-sm text-gray-600">
                Formatted: <span className="font-medium">{formatCurrency(config.manualValue)}</span>
                {config.manualValue >= 100000 && (
                  <span className="text-gray-400"> ({formatCompactNumber(config.manualValue)})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auto Mode - Business Metrics Form */}
        {config.mode === "auto" && <BusinessMetricsForm />}

        {/* Current Valuation Display */}
        {currentValuation !== null && currentValuation > 0 && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="text-sm text-green-700">Current Valuation</div>
            <div className="text-2xl font-bold text-green-800">
              {formatCompactNumber(currentValuation)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {formatCurrency(currentValuation)}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={
              !hasChanges ||
              (config.mode === "manual" && (config.manualValue === null || config.manualValue <= 0)) ||
              (config.mode === "auto" && (!config.businessMetrics || config.businessMetrics.currentYearProfit <= 0))
            }
          >
            Save Valuation
          </Button>

          {saveSuccess && (
            <span className="text-sm font-medium text-green-600">
              Valuation saved successfully!
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <ValuationDisclaimer />

        {/* Last Updated */}
        {config.lastUpdated && (
          <div className="text-xs text-gray-400">
            Last updated: {new Date(config.lastUpdated).toLocaleString()}
          </div>
        )}
      </CardBody>

      {/* Disclaimer Modal for first-time acknowledgment */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        onAccept={handleDisclaimerAccept}
      />
    </Card>
  );
}

export default ValuationConfig;
