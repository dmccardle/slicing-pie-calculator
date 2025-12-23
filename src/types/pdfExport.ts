/**
 * PDF Export Types
 * Types for the enhanced PDF export functionality
 */

/**
 * Configuration for what to include in the PDF export
 */
export interface PDFExportOptions {
  /** Include detailed contributions breakdown by contributor */
  includeContributionsBreakdown: boolean;

  /** Include dollar values (requires valuation to be set) */
  includeValuation: boolean;

  /** Include vesting breakdown and projections (requires vesting feature) */
  includeVesting: boolean;
}

/**
 * Formatted row for the summary table in the PDF
 */
export interface ContributorSummaryRow {
  /** Contributor display name */
  name: string;

  /** Total slices earned */
  totalSlices: number;

  /** Percentage of total pie (0-100) */
  percentage: number;

  /** Dollar value of equity (only when valuation included) */
  dollarValue?: number;

  /** Currently vested slices (only when vesting included) */
  vestedSlices?: number;

  /** Dollar value of vested slices (only when vesting + valuation included) */
  vestedDollarValue?: number;

  /** Date when vesting will be complete (only when vesting included) */
  vestingCompletionDate?: string;
}

/**
 * Formatted row for the contributions breakdown table
 */
export interface ContributionDetailRow {
  /** Date of contribution (formatted string) */
  date: string;

  /** Contribution type (Time, Cash, Non-Cash, Ideas, Relationships) */
  type: string;

  /** Description of the contribution */
  description: string;

  /** Raw value (hours, dollars, etc.) */
  value: number;

  /** Formatted value with unit (e.g., "10 hours", "$500") */
  formattedValue: string;

  /** Slices earned for this contribution */
  slices: number;
}

/**
 * A section in the PDF showing one contributor's contributions
 */
export interface ContributorContributionsSection {
  /** Contributor name (section header) */
  contributorName: string;

  /** Subtotal of slices for this contributor */
  subtotalSlices: number;

  /** Individual contribution rows */
  contributions: ContributionDetailRow[];
}

/**
 * Row for the vesting projections table
 */
export interface VestingProjectionRow {
  /** Projection date (formatted string) */
  date: string;

  /** Contributor name */
  contributorName: string;

  /** Projected vested slices at this date */
  vestedSlices: number;

  /** Projected unvested slices at this date */
  unvestedSlices: number;

  /** Vested percentage at this date */
  vestedPercentage: number;
}

/**
 * Complete data structure for generating the PDF report
 */
export interface PDFReportData {
  /** Company name for header */
  companyName: string;

  /** Export date (ISO string) */
  exportDate: string;

  /** Chart data for pie chart (name, value, color) */
  chartData: Array<{ name: string; value: number; color?: string }>;

  /** Summary table rows */
  summaryRows: ContributorSummaryRow[];

  /** Total slices across all contributors */
  totalSlices: number;

  /** Company valuation in dollars (optional) */
  companyValuation?: number;

  /** Contributions breakdown sections (optional) */
  contributionsSections?: ContributorContributionsSection[];

  /** Vesting projections (optional) */
  vestingProjections?: VestingProjectionRow[];
}

/**
 * Default PDF export options
 */
export const DEFAULT_PDF_EXPORT_OPTIONS: PDFExportOptions = {
  includeContributionsBreakdown: true,
  includeValuation: false,
  includeVesting: false,
};
