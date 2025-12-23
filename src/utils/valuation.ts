/**
 * Valuation Utility Functions
 * Formatting, conversion, and calculation utilities for company valuation
 */

import type {
  BusinessMetrics,
  ConfidenceLevel,
  ValuationResult,
} from '@/types/valuation';
import { BASE_MULTIPLE } from '@/types/valuation';

// ============================================================================
// Currency Conversion Utilities
// ============================================================================

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents (rounds to nearest cent)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format cents as currency string (e.g., "$1,234.56")
 */
export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

/**
 * Format cents as compact currency string (e.g., "$1.2M", "$500K")
 */
export function formatCompactNumber(cents: number): string {
  const dollars = centsToDollars(cents);

  // For small numbers, show full amount
  if (Math.abs(dollars) < 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(dollars);
  }

  // For larger numbers, use compact notation
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(dollars);
}

/**
 * Format a percentage (0-100) for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse a currency input string to cents
 * Handles formats like "$1,234", "1234.56", "$1.2M"
 */
export function parseCurrencyInput(input: string): number | null {
  if (!input || input.trim() === '') return null;

  // Remove currency symbol and commas
  const cleaned = input.replace(/[$,]/g, '').trim();

  // Handle K/M/B suffixes
  const suffixMatch = cleaned.match(/^([\d.]+)\s*([KMBkmb])$/);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2].toUpperCase();
    const multipliers: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000 };
    const dollars = num * (multipliers[suffix] || 1);
    return dollarsToCents(dollars);
  }

  // Standard number parsing
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;

  return dollarsToCents(parsed);
}

// ============================================================================
// Valuation Calculation Utilities
// ============================================================================

/**
 * Calculate growth multiplier based on profit trend
 * Returns value between 0.5 and 2.0
 */
export function calculateGrowthMultiplier(metrics: BusinessMetrics): number {
  const allProfits = [
    { year: new Date().getFullYear(), profit: metrics.currentYearProfit },
    ...metrics.profitHistory,
  ].sort((a, b) => a.year - b.year);

  if (allProfits.length < 2) {
    return 1.0; // No growth data available
  }

  const earliest = allProfits[0];
  const latest = allProfits[allProfits.length - 1];
  const years = latest.year - earliest.year;

  if (years === 0 || earliest.profit === 0) {
    return 1.0;
  }

  // Calculate compound annual growth rate
  const growthRate = (latest.profit - earliest.profit) / Math.abs(earliest.profit) / years;

  // Apply growth multiplier formula: 1 + (growthRate × 0.5), clamped to [0.5, 2.0]
  const multiplier = 1 + (growthRate * 0.5);
  return Math.max(0.5, Math.min(2.0, multiplier));
}

/**
 * Calculate retention multiplier based on churn rate
 * Returns value between 0.5 and 1.0
 */
export function calculateRetentionMultiplier(churnRate: number | null): number {
  if (churnRate === null) {
    return 1.0; // No churn data, assume full retention
  }

  // Formula: 1 - (churnRate × 0.3), clamped to [0.5, 1.0]
  const multiplier = 1 - ((churnRate / 100) * 0.3);
  return Math.max(0.5, Math.min(1.0, multiplier));
}

/**
 * Get confidence level based on data completeness
 */
export function getConfidenceLevel(metrics: BusinessMetrics): ConfidenceLevel {
  const yearsOfData = metrics.profitHistory.length + 1; // +1 for current year
  const hasChurnRate = metrics.churnRate !== null;

  if (yearsOfData >= 3 && hasChurnRate) {
    return 'high';
  }

  if (yearsOfData >= 2 || hasChurnRate) {
    return 'medium';
  }

  return 'low';
}

/**
 * Calculate valuation from business metrics
 * Uses SDE multiple approach with growth and retention adjustments
 */
export function calculateValuation(metrics: BusinessMetrics): ValuationResult {
  // Calculate average profit
  const allProfits = [
    metrics.currentYearProfit,
    ...metrics.profitHistory.map(p => p.profit),
  ];
  const averageProfit = allProfits.reduce((sum, p) => sum + p, 0) / allProfits.length;

  // Calculate multipliers
  const growthMultiplier = calculateGrowthMultiplier(metrics);
  const retentionMultiplier = calculateRetentionMultiplier(metrics.churnRate);

  // Calculate valuation
  // Base = averageProfit × baseMultiple
  // Adjusted = base × growthMultiplier × retentionMultiplier
  const baseValuation = averageProfit * BASE_MULTIPLE;
  const adjustedValuation = baseValuation * growthMultiplier * retentionMultiplier;

  // Ensure non-negative (negative profits can result in negative valuation)
  const finalValue = Math.max(0, Math.round(adjustedValuation));

  return {
    value: finalValue,
    confidence: getConfidenceLevel(metrics),
    breakdown: {
      averageProfit: Math.round(averageProfit),
      baseMultiple: BASE_MULTIPLE,
      growthMultiplier: Math.round(growthMultiplier * 100) / 100,
      retentionMultiplier: Math.round(retentionMultiplier * 100) / 100,
    },
  };
}

/**
 * Get the current valuation value based on config
 */
export function getCurrentValuation(
  mode: 'manual' | 'auto',
  manualValue: number | null,
  businessMetrics: BusinessMetrics | null
): number | null {
  if (mode === 'manual') {
    return manualValue;
  }

  if (mode === 'auto' && businessMetrics) {
    return calculateValuation(businessMetrics).value;
  }

  return null;
}

/**
 * Calculate equity value for a contributor
 */
export function calculateEquityValue(
  contributorSlices: number,
  totalSlices: number,
  valuationCents: number
): number {
  if (totalSlices === 0) return 0;
  return Math.round((contributorSlices / totalSlices) * valuationCents);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate manual valuation input (must be positive)
 */
export function validateManualValuation(cents: number): string | null {
  if (cents <= 0) {
    return 'Valuation must be a positive amount';
  }
  return null;
}

/**
 * Validate churn rate (must be 0-100)
 */
export function validateChurnRate(rate: number): string | null {
  if (rate < 0) {
    return 'Churn rate cannot be negative';
  }
  if (rate > 100) {
    return 'Churn rate cannot exceed 100%';
  }
  return null;
}

/**
 * Validate profit year (must be in the past)
 */
export function validateProfitYear(year: number): string | null {
  const currentYear = new Date().getFullYear();
  if (year > currentYear) {
    return 'Year cannot be in the future';
  }
  if (year < currentYear - 10) {
    return 'Year is too far in the past';
  }
  return null;
}

// ============================================================================
// Confidence Level Display Helpers
// ============================================================================

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
};

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: 'text-green-600 bg-green-100',
  medium: 'text-amber-600 bg-amber-100',
  low: 'text-orange-600 bg-orange-100',
};

export const CONFIDENCE_DESCRIPTIONS: Record<ConfidenceLevel, string> = {
  high: '3+ years of profit data with churn rate provides a reliable estimate',
  medium: 'Limited historical data - estimate may be less accurate',
  low: 'Only current year data - consider adding historical data for better accuracy',
};
