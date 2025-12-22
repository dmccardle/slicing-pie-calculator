"use client";

import React from "react";
import type { AISuggestion } from "@/types/ai";
import { CONTRIBUTION_TYPE_LABELS } from "@/types/slicingPie";
import { formatCurrency, formatSlices, MULTIPLIERS } from "@/utils/slicingPie";
import { Button } from "@/components/ui/Button";

interface SuggestionCardProps {
  suggestion: AISuggestion;
  hourlyRate?: number;
  onApply?: () => void;
  compact?: boolean;
}

const CONFIDENCE_COLORS = {
  low: "bg-amber-100 text-amber-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-green-100 text-green-800",
};

export function SuggestionCard({
  suggestion,
  hourlyRate,
  onApply,
  compact = false,
}: SuggestionCardProps) {
  const multiplier = MULTIPLIERS[suggestion.type];

  // Calculate slices for display
  let slices = suggestion.value * multiplier;
  if (suggestion.type === "time" && hourlyRate) {
    slices = suggestion.value * hourlyRate * multiplier;
  }

  const formatValue = () => {
    if (suggestion.type === "time") {
      return `${suggestion.value} hour${suggestion.value !== 1 ? "s" : ""}`;
    }
    if (suggestion.dollarValue) {
      return formatCurrency(suggestion.dollarValue);
    }
    return formatCurrency(suggestion.value);
  };

  if (compact) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-blue-900">
              {CONTRIBUTION_TYPE_LABELS[suggestion.type]}
            </span>
            <span className="mx-2 text-blue-400">|</span>
            <span className="text-sm text-blue-700">{formatValue()}</span>
            <span className="mx-2 text-blue-400">|</span>
            <span className="text-sm font-semibold text-blue-900">
              {formatSlices(slices)} slices
            </span>
          </div>
          {onApply && (
            <Button variant="primary" size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          {/* Type and Value */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-blue-800">
              {CONTRIBUTION_TYPE_LABELS[suggestion.type]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                CONFIDENCE_COLORS[suggestion.confidence]
              }`}
            >
              {suggestion.confidence} confidence
            </span>
          </div>

          {/* Value Display */}
          <div className="space-y-1">
            <p className="text-lg font-semibold text-blue-900">
              {formatValue()}
              {suggestion.type !== "time" && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  x {multiplier} = {formatSlices(slices)} slices
                </span>
              )}
              {suggestion.type === "time" && hourlyRate && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  x {formatCurrency(hourlyRate)}/hr x {multiplier} ={" "}
                  {formatSlices(slices)} slices
                </span>
              )}
            </p>
          </div>

          {/* Reasoning */}
          {suggestion.reasoning && (
            <p className="text-sm text-blue-700">{suggestion.reasoning}</p>
          )}
        </div>

        {/* Apply button */}
        {onApply && (
          <Button variant="primary" size="sm" onClick={onApply}>
            Use This
          </Button>
        )}
      </div>
    </div>
  );
}

export default SuggestionCard;
