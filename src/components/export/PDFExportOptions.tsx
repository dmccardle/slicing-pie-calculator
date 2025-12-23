/**
 * PDFExportOptions Component
 * Renders toggle controls for PDF export configuration
 */

"use client";

import React from "react";
import type { PDFExportOptions as PDFExportOptionsType } from "@/types";

interface PDFExportOptionsProps {
  /** Current export options state */
  options: PDFExportOptionsType;

  /** Callback when options change */
  onChange: (options: PDFExportOptionsType) => void;

  /** Whether valuation data is available (has valuation set) */
  valuationAvailable: boolean;

  /** Whether vesting feature is enabled */
  vestingEnabled: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Toggle switch component for PDF options
 */
function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 pt-0.5">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={`
            relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
            ${checked ? "bg-blue-600" : "bg-gray-200"}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
              transition duration-200 ease-in-out
              ${checked ? "translate-x-4" : "translate-x-0"}
            `}
          />
        </button>
      </div>
      <label
        htmlFor={id}
        className={`flex-1 ${disabled ? "opacity-50" : "cursor-pointer"}`}
      >
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </label>
    </div>
  );
}

/**
 * PDF Export Options panel with toggles for different sections
 */
export function PDFExportOptions({
  options,
  onChange,
  valuationAvailable,
  vestingEnabled,
  className = "",
}: PDFExportOptionsProps) {
  const handleToggle = (key: keyof PDFExportOptionsType, value: boolean) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        PDF Options
      </p>

      <Toggle
        id="pdf-contributions-breakdown"
        label="Include contributions breakdown"
        description="Show detailed list of all contributions by contributor"
        checked={options.includeContributionsBreakdown}
        onChange={(v) => handleToggle("includeContributionsBreakdown", v)}
      />

      <Toggle
        id="pdf-valuation"
        label="Include valuation"
        description={
          valuationAvailable
            ? "Show dollar values based on company valuation"
            : "Set a company valuation first"
        }
        checked={options.includeValuation}
        onChange={(v) => handleToggle("includeValuation", v)}
        disabled={!valuationAvailable}
      />

      {vestingEnabled && (
        <Toggle
          id="pdf-vesting"
          label="Include vesting breakdown"
          description="Show vested/unvested equity and projections"
          checked={options.includeVesting}
          onChange={(v) => handleToggle("includeVesting", v)}
        />
      )}
    </div>
  );
}

export default PDFExportOptions;
