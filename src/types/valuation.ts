/**
 * Company Valuation Types
 * All monetary values stored in cents (integers) to avoid floating-point precision issues
 */

/**
 * Valuation mode - manual entry or auto-calculated from metrics
 */
export type ValuationMode = 'manual' | 'auto';

/**
 * Confidence level for auto-calculated valuations
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * A single year's profit data for historical tracking
 */
export interface ProfitYear {
  year: number;           // e.g., 2024
  profit: number;         // In cents (can be negative)
}

/**
 * Business performance metrics for auto-calculation
 */
export interface BusinessMetrics {
  currentYearProfit: number;      // In cents (can be negative)
  profitHistory: ProfitYear[];    // Up to 5 previous years, sorted by year descending
  churnRate: number | null;       // 0-100 (percentage) or null if not provided
}

/**
 * Main valuation configuration entity
 */
export interface ValuationConfig {
  // Feature state
  enabled: boolean;                    // Whether valuation feature is active
  disclaimerAcknowledged: boolean;     // User has accepted legal disclaimer

  // Mode selection
  mode: ValuationMode;                 // Which calculation mode is active

  // Manual mode data
  manualValue: number | null;          // User-entered valuation in cents

  // Auto mode data
  businessMetrics: BusinessMetrics | null;

  // Metadata
  lastUpdated: string;                 // ISO timestamp
}

/**
 * A snapshot of a valuation at a point in time for history tracking
 */
export interface ValuationHistoryEntry {
  id: string;                          // Unique identifier (UUID)
  timestamp: string;                   // ISO timestamp when saved
  mode: ValuationMode;                 // Mode used for this entry
  value: number;                       // Valuation in cents

  // Snapshot of inputs (for display/restore)
  manualValue: number | null;
  businessMetrics: BusinessMetrics | null;
}

/**
 * Computed entity for displaying the Equity Values table
 * Not stored - computed at render time
 */
export interface EquityValueRow {
  contributorId: string;
  contributorName: string;
  slices: number;                      // Total slices
  percentage: number;                  // 0-100
  totalValue: number;                  // In cents

  // Optional: only present if vesting enabled
  vestedSlices?: number;
  vestedPercentage?: number;
  vestedValue?: number;
}

/**
 * Result of valuation calculation with metadata
 */
export interface ValuationResult {
  value: number;                       // Calculated valuation in cents
  confidence: ConfidenceLevel;         // Confidence based on data completeness
  breakdown: {
    averageProfit: number;             // In cents
    baseMultiple: number;
    growthMultiplier: number;
    retentionMultiplier: number;
  };
}

/**
 * Default values
 */
export const DEFAULT_BUSINESS_METRICS: BusinessMetrics = {
  currentYearProfit: 0,
  profitHistory: [],
  churnRate: null,
};

export const DEFAULT_VALUATION_CONFIG: ValuationConfig = {
  enabled: false,
  disclaimerAcknowledged: false,
  mode: 'manual',
  manualValue: null,
  businessMetrics: null,
  lastUpdated: new Date().toISOString(),
};

/**
 * Base multiple for SDE valuation (industry standard for small businesses)
 */
export const BASE_MULTIPLE = 3.0;

/**
 * Maximum history entries to store
 */
export const MAX_HISTORY_ENTRIES = 20;
