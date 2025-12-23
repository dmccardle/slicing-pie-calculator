"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import { useValuation } from "@/hooks/useValuation";
import {
  formatCurrency,
  formatCompactNumber,
  dollarsToCents,
  centsToDollars,
  validateChurnRate,
  CONFIDENCE_LABELS,
  CONFIDENCE_COLORS,
  CONFIDENCE_DESCRIPTIONS,
} from "@/utils/valuation";
import type { BusinessMetrics, ProfitYear } from "@/types/valuation";

const MAX_PROFIT_YEARS = 5;
const CURRENT_YEAR = new Date().getFullYear();

interface BusinessMetricsFormProps {
  onChange?: (metrics: BusinessMetrics) => void;
}

export function BusinessMetricsForm({ onChange }: BusinessMetricsFormProps) {
  const { config, calculationResult, setBusinessMetrics } = useValuation();

  // Local state for form inputs
  const [currentYearProfit, setCurrentYearProfit] = useState<string>("");
  const [profitHistory, setProfitHistory] = useState<{ year: string; profit: string }[]>([]);
  const [churnRate, setChurnRate] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFormula, setShowFormula] = useState(false);

  // Initialize from existing config
  useEffect(() => {
    if (config.businessMetrics) {
      setCurrentYearProfit(centsToDollars(config.businessMetrics.currentYearProfit).toString());
      setProfitHistory(
        config.businessMetrics.profitHistory.map((p) => ({
          year: p.year.toString(),
          profit: centsToDollars(p.profit).toString(),
        }))
      );
      setChurnRate(config.businessMetrics.churnRate?.toString() || "");
    }
  }, [config.businessMetrics]);

  // Build metrics from form state
  const buildMetrics = useCallback((): BusinessMetrics | null => {
    const currentProfit = parseFloat(currentYearProfit);
    if (isNaN(currentProfit)) return null;

    const history: ProfitYear[] = profitHistory
      .filter((p) => p.year && p.profit)
      .map((p) => ({
        year: parseInt(p.year, 10),
        profit: dollarsToCents(parseFloat(p.profit)),
      }))
      .filter((p) => !isNaN(p.year) && !isNaN(p.profit));

    const churnValue = churnRate.trim() !== "" ? parseFloat(churnRate) : null;

    return {
      currentYearProfit: dollarsToCents(currentProfit),
      profitHistory: history,
      churnRate: churnValue !== null && !isNaN(churnValue) ? churnValue : null,
    };
  }, [currentYearProfit, profitHistory, churnRate]);

  // Update metrics on change
  useEffect(() => {
    const metrics = buildMetrics();
    if (metrics) {
      setBusinessMetrics(metrics);
      onChange?.(metrics);
    }
  }, [buildMetrics, setBusinessMetrics, onChange]);

  const handleCurrentProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentYearProfit(value);
    setErrors((prev) => ({ ...prev, currentYear: "" }));
  };

  const handleChurnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChurnRate(value);

    if (value.trim() !== "") {
      const rate = parseFloat(value);
      const error = validateChurnRate(rate);
      setErrors((prev) => ({ ...prev, churn: error || "" }));
    } else {
      setErrors((prev) => ({ ...prev, churn: "" }));
    }
  };

  const addProfitYear = () => {
    if (profitHistory.length >= MAX_PROFIT_YEARS) return;

    // Suggest the next year back
    const usedYears = profitHistory.map((p) => parseInt(p.year, 10)).filter((y) => !isNaN(y));
    const minYear = usedYears.length > 0 ? Math.min(...usedYears) : CURRENT_YEAR;
    const suggestedYear = minYear - 1;

    setProfitHistory((prev) => [
      ...prev,
      { year: suggestedYear.toString(), profit: "" },
    ]);
  };

  const removeProfitYear = (index: number) => {
    setProfitHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProfitYear = (index: number, field: "year" | "profit", value: string) => {
    setProfitHistory((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const hasValidData = currentYearProfit.trim() !== "" && !isNaN(parseFloat(currentYearProfit));

  return (
    <div className="space-y-6">
      {/* Current Year Profit */}
      <div>
        <Input
          label={`${CURRENT_YEAR} Net Profit`}
          type="text"
          inputMode="decimal"
          placeholder="e.g., 150000"
          value={currentYearProfit}
          onChange={handleCurrentProfitChange}
          error={errors.currentYear}
          helperText="Enter your current year net profit in dollars"
        />
      </div>

      {/* Historical Profit Years */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Historical Profit (Optional)
          </label>
          {profitHistory.length < MAX_PROFIT_YEARS && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addProfitYear}
            >
              + Add Year
            </Button>
          )}
        </div>

        {profitHistory.length === 0 && (
          <p className="text-sm text-gray-500">
            Add historical profit data to improve valuation accuracy.
          </p>
        )}

        {profitHistory.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-24">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Year"
                value={entry.year}
                onChange={(e) => updateProfitYear(index, "year", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Net profit"
                value={entry.profit}
                onChange={(e) => updateProfitYear(index, "profit", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => removeProfitYear(index)}
              className="flex-shrink-0"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Churn Rate */}
      <div>
        <Input
          label="Customer Churn Rate (Optional)"
          type="text"
          inputMode="decimal"
          placeholder="e.g., 5.5"
          value={churnRate}
          onChange={handleChurnChange}
          error={errors.churn}
          helperText="Annual customer churn rate as a percentage (0-100)"
        />
      </div>

      {/* Calculated Valuation */}
      {hasValidData && calculationResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700">Estimated Valuation</div>
              <div className="text-2xl font-bold text-green-800">
                {formatCompactNumber(calculationResult.value)}
              </div>
              <div className="text-xs text-green-600">
                {formatCurrency(calculationResult.value)}
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  CONFIDENCE_COLORS[calculationResult.confidence]
                }`}
              >
                {CONFIDENCE_LABELS[calculationResult.confidence]}
              </span>
            </div>
          </div>

          <p className="text-xs text-green-600">
            {CONFIDENCE_DESCRIPTIONS[calculationResult.confidence]}
          </p>

          {/* Formula Explanation Toggle */}
          <div className="border-t border-green-200 pt-3">
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800"
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>{showFormula ? "Hide" : "Show"} calculation breakdown</span>
              <svg
                className={`h-4 w-4 transition-transform ${showFormula ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFormula && (
              <div className="mt-3 rounded-lg bg-white p-3 text-sm space-y-2">
                <h4 className="font-medium text-gray-900">Valuation Formula</h4>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Average Net Profit:</span>
                    <span className="font-medium">
                      {formatCurrency(calculationResult.breakdown.averageProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Multiple:</span>
                    <span className="font-medium">
                      {calculationResult.breakdown.baseMultiple}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Multiplier:</span>
                    <span className="font-medium">
                      {calculationResult.breakdown.growthMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Multiplier:</span>
                    <span className="font-medium">
                      {calculationResult.breakdown.retentionMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium text-gray-900">
                    <span>Final Valuation:</span>
                    <span>{formatCompactNumber(calculationResult.value)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Valuation = Avg Profit x Base Multiple x Growth x Retention
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasValidData && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
          Enter current year profit to see calculated valuation
        </div>
      )}
    </div>
  );
}

export default BusinessMetricsForm;
