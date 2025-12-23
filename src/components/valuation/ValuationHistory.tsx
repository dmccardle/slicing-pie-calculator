"use client";

import React from "react";
import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import { useValuation } from "@/hooks/useValuation";
import { formatCompactNumber } from "@/utils/valuation";
import type { ValuationHistoryEntry } from "@/types/valuation";

/**
 * Format a timestamp for display
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get trend indicator between two values
 */
function getTrendIndicator(
  current: number,
  previous: number | null
): { icon: React.ReactNode; color: string } | null {
  if (previous === null) return null;

  if (current > previous) {
    return {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      ),
      color: "text-green-600",
    };
  }

  if (current < previous) {
    return {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      ),
      color: "text-red-600",
    };
  }

  return {
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    ),
    color: "text-gray-400",
  };
}

interface ValuationHistoryItemProps {
  entry: ValuationHistoryEntry;
  previousValue: number | null;
  onRestore: (entryId: string) => void;
  isFirst: boolean;
}

function ValuationHistoryItem({
  entry,
  previousValue,
  onRestore,
  isFirst,
}: ValuationHistoryItemProps) {
  const trend = getTrendIndicator(entry.value, previousValue);

  return (
    <div
      className={`flex items-center justify-between py-3 ${
        !isFirst ? "border-t border-gray-100" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Trend Indicator */}
        {trend && (
          <div className={`flex-shrink-0 ${trend.color}`}>{trend.icon}</div>
        )}
        {!trend && <div className="w-4" />}

        {/* Value and Details */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {formatCompactNumber(entry.value)}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                entry.mode === "manual"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {entry.mode === "manual" ? "Manual" : "Auto"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatTimestamp(entry.timestamp)}
          </div>
        </div>
      </div>

      {/* Restore Button */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onRestore(entry.id)}
      >
        Restore
      </Button>
    </div>
  );
}

interface ValuationHistoryProps {
  showHeader?: boolean;
  maxItems?: number;
}

export function ValuationHistory({
  showHeader = true,
  maxItems,
}: ValuationHistoryProps) {
  const { history, restoreFromHistory, isLoading } = useValuation();

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const displayHistory = maxItems ? history.slice(0, maxItems) : history;

  if (history.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Valuation History
            </h2>
          </CardHeader>
        )}
        <CardBody>
          <div className="py-8 text-center text-sm text-gray-500">
            No valuation history yet. Save a valuation to start tracking changes.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Valuation History
            </h2>
            <span className="text-sm text-gray-500">
              {history.length} {history.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </CardHeader>
      )}
      <CardBody className="space-y-0">
        {displayHistory.map((entry, index) => {
          // Get the value of the next entry (older) for trend comparison
          const nextEntry = displayHistory[index + 1];
          const previousValue = nextEntry ? nextEntry.value : null;

          return (
            <ValuationHistoryItem
              key={entry.id}
              entry={entry}
              previousValue={previousValue}
              onRestore={restoreFromHistory}
              isFirst={index === 0}
            />
          );
        })}

        {maxItems && history.length > maxItems && (
          <div className="border-t border-gray-100 pt-3 text-center">
            <span className="text-xs text-gray-500">
              Showing {maxItems} of {history.length} entries
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default ValuationHistory;
