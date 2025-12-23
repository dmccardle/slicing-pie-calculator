/**
 * PDF Data Formatter Utility
 * Transforms raw entity data into formatted PDF report data
 */

import type {
  PDFExportOptions,
  PDFReportData,
  ContributorSummaryRow,
  ContributionDetailRow,
  VestingProjectionRow,
} from "@/types";
import type {
  Company,
  Contributor,
  Contribution,
  ContributionType,
  VestingConfig,
  VestingStatus,
} from "@/types/slicingPie";
import { CHART_COLORS } from "@/components/charts/PieChart";

/**
 * Valuation configuration for calculating dollar values
 */
export interface ValuationConfig {
  mode: "manual" | "auto";
  manualValue: number | null;
}

/**
 * Contribution type display labels
 */
const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  time: "Time",
  cash: "Cash",
  "non-cash": "Non-Cash",
  idea: "Idea/IP",
  relationship: "Relationship",
};

/**
 * Format a number as currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousands separator
 */
function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date string (YYYY-MM-DD) for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate vesting status for a contributor at a given date
 */
function calculateVestingStatus(
  vesting: VestingConfig | undefined,
  totalSlices: number,
  asOfDate: Date = new Date()
): VestingStatus | null {
  if (!vesting) return null;

  const startDate = new Date(vesting.startDate + "T00:00:00");
  const monthsElapsed = Math.floor(
    (asOfDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Pre-cliff period
  if (monthsElapsed < vesting.cliffMonths) {
    return {
      state: "preCliff",
      percentVested: 0,
      vestedSlices: 0,
      unvestedSlices: totalSlices,
      cliffDate: addMonths(startDate, vesting.cliffMonths),
      fullVestDate: addMonths(startDate, vesting.vestingMonths),
      monthsUntilCliff: vesting.cliffMonths - monthsElapsed,
      monthsUntilFullVest: vesting.vestingMonths - monthsElapsed,
    };
  }

  // Fully vested
  if (monthsElapsed >= vesting.vestingMonths) {
    return {
      state: "fullyVested",
      percentVested: 100,
      vestedSlices: totalSlices,
      unvestedSlices: 0,
      cliffDate: addMonths(startDate, vesting.cliffMonths),
      fullVestDate: addMonths(startDate, vesting.vestingMonths),
      monthsUntilCliff: 0,
      monthsUntilFullVest: 0,
    };
  }

  // Vesting period
  const vestingProgress =
    (monthsElapsed - vesting.cliffMonths) /
    (vesting.vestingMonths - vesting.cliffMonths);
  const percentVested = Math.min(100, Math.round(vestingProgress * 100));
  const vestedSlices = Math.round((percentVested / 100) * totalSlices);

  return {
    state: "vesting",
    percentVested,
    vestedSlices,
    unvestedSlices: totalSlices - vestedSlices,
    cliffDate: addMonths(startDate, vesting.cliffMonths),
    fullVestDate: addMonths(startDate, vesting.vestingMonths),
    monthsUntilCliff: 0,
    monthsUntilFullVest: vesting.vestingMonths - monthsElapsed,
  };
}

/**
 * Helper to add months to a date
 */
function addMonths(date: Date, months: number): string {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().split("T")[0];
}

/**
 * Format a contribution's value with appropriate unit
 */
function formatContributionValue(
  contribution: Contribution,
  contributor: Contributor
): string {
  switch (contribution.type) {
    case "time":
      return `${formatNumber(contribution.value)} hrs @ ${formatCurrency(contributor.hourlyRate)}/hr`;
    case "cash":
      return formatCurrency(contribution.value);
    case "non-cash":
      return formatCurrency(contribution.value);
    case "idea":
      return formatCurrency(contribution.value);
    case "relationship":
      return formatCurrency(contribution.value);
    default:
      return formatNumber(contribution.value);
  }
}

/**
 * Format a contributor's summary row for the PDF
 */
export function formatContributorSummary(
  contributor: Contributor,
  contributions: Contribution[],
  totalSlices: number,
  valuation: number | null,
  includeVesting: boolean
): ContributorSummaryRow {
  const contributorContributions = contributions.filter(
    (c) => c.contributorId === contributor.id && !c.deletedAt
  );

  const slices = contributorContributions.reduce((sum, c) => sum + c.slices, 0);
  const percentage = totalSlices > 0 ? (slices / totalSlices) * 100 : 0;

  const row: ContributorSummaryRow = {
    name: contributor.name,
    totalSlices: slices,
    percentage,
  };

  // Add dollar value if valuation is provided
  if (valuation !== null && valuation > 0) {
    row.dollarValue = (percentage / 100) * valuation;
  }

  // Add vesting info if enabled
  if (includeVesting && contributor.vesting) {
    const vestingStatus = calculateVestingStatus(contributor.vesting, slices);
    if (vestingStatus) {
      row.vestedSlices = vestingStatus.vestedSlices;
      row.vestingCompletionDate = vestingStatus.fullVestDate
        ? formatDate(vestingStatus.fullVestDate)
        : undefined;

      // Calculate vested dollar value if valuation is provided
      if (valuation !== null && valuation > 0 && totalSlices > 0) {
        const vestedPercentage = (vestingStatus.vestedSlices / totalSlices) * 100;
        row.vestedDollarValue = (vestedPercentage / 100) * valuation;
      }
    }
  }

  return row;
}

/**
 * Format contribution details for a single contribution
 */
export function formatContributionDetails(
  contributions: Contribution[],
  contributors: Contributor[]
): ContributionDetailRow[] {
  // Create a map of contributor IDs to contributors for quick lookup
  const contributorMap = new Map(contributors.map((c) => [c.id, c]));

  return contributions
    .filter((c) => !c.deletedAt)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((contribution) => {
      const contributor = contributorMap.get(contribution.contributorId);
      const formattedValue = contributor
        ? formatContributionValue(contribution, contributor)
        : formatNumber(contribution.value);

      return {
        date: formatDate(contribution.date),
        type: CONTRIBUTION_TYPE_LABELS[contribution.type] || contribution.type,
        description: contribution.description || CONTRIBUTION_TYPE_LABELS[contribution.type] || contribution.type,
        value: contribution.value,
        formattedValue,
        slices: contribution.slices,
      };
    });
}

/**
 * Calculate vesting projections for all contributors
 * Generates projections at 6-month intervals for 2 years
 */
export function calculateVestingProjections(
  contributors: Contributor[],
  contributions: Contribution[]
): VestingProjectionRow[] {
  const projections: VestingProjectionRow[] = [];
  const today = new Date();

  // Get contributors with vesting configured
  const contributorsWithVesting = contributors.filter(
    (c) => c.vesting && !c.deletedAt
  );

  if (contributorsWithVesting.length === 0) {
    return [];
  }

  // Calculate totals per contributor
  const contributorSlices = new Map<string, number>();
  contributions
    .filter((c) => !c.deletedAt)
    .forEach((c) => {
      const current = contributorSlices.get(c.contributorId) || 0;
      contributorSlices.set(c.contributorId, current + c.slices);
    });

  // Generate projections at 6-month intervals
  const intervals = [6, 12, 18, 24];

  for (const months of intervals) {
    const projectionDate = new Date(today);
    projectionDate.setMonth(projectionDate.getMonth() + months);

    for (const contributor of contributorsWithVesting) {
      const totalSlices = contributorSlices.get(contributor.id) || 0;
      if (totalSlices === 0) continue;

      const vestingStatus = calculateVestingStatus(
        contributor.vesting,
        totalSlices,
        projectionDate
      );

      if (vestingStatus) {
        projections.push({
          date: formatDate(projectionDate.toISOString().split("T")[0]),
          contributorName: contributor.name,
          vestedSlices: vestingStatus.vestedSlices,
          unvestedSlices: vestingStatus.unvestedSlices,
          vestedPercentage: vestingStatus.percentVested,
        });
      }
    }
  }

  return projections;
}

/**
 * Format all data needed for PDF generation
 */
export function formatPDFReportData(
  company: Company,
  contributors: Contributor[],
  contributions: Contribution[],
  valuationConfig: ValuationConfig | null,
  options: PDFExportOptions
): PDFReportData {
  // Filter out deleted entities
  const activeContributors = contributors.filter((c) => !c.deletedAt);
  const activeContributions = contributions.filter((c) => !c.deletedAt);

  // Calculate total slices
  const totalSlices = activeContributions.reduce((sum, c) => sum + c.slices, 0);

  // Get valuation value
  const valuation =
    valuationConfig?.manualValue && options.includeValuation
      ? valuationConfig.manualValue
      : null;

  // Generate summary rows with colors for chart consistency
  const summaryRows: ContributorSummaryRow[] = activeContributors
    .map((contributor) => {
      const row = formatContributorSummary(
        contributor,
        activeContributions,
        totalSlices,
        valuation,
        options.includeVesting
      );
      return row;
    })
    .filter((row) => row.totalSlices > 0)
    .sort((a, b) => b.totalSlices - a.totalSlices);

  // Generate chart data with consistent colors
  const chartData = summaryRows.map((row, index) => ({
    name: row.name,
    value: row.totalSlices,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // Build report data
  const reportData: PDFReportData = {
    companyName: company.name,
    exportDate: new Date().toISOString(),
    chartData,
    summaryRows,
    totalSlices,
  };

  // Add valuation if enabled
  if (valuation !== null) {
    reportData.companyValuation = valuation;
  }

  // Add contributions breakdown if enabled
  if (options.includeContributionsBreakdown) {
    reportData.contributionsSections = activeContributors
      .filter((contributor) => {
        const contribs = activeContributions.filter(
          (c) => c.contributorId === contributor.id
        );
        return contribs.length > 0;
      })
      .map((contributor) => {
        const contribs = activeContributions.filter(
          (c) => c.contributorId === contributor.id
        );
        const subtotal = contribs.reduce((sum, c) => sum + c.slices, 0);

        return {
          contributorName: contributor.name,
          subtotalSlices: subtotal,
          contributions: formatContributionDetails(contribs, [contributor]),
        };
      })
      .sort((a, b) => b.subtotalSlices - a.subtotalSlices);
  }

  // Add vesting projections if enabled
  if (options.includeVesting) {
    reportData.vestingProjections = calculateVestingProjections(
      activeContributors,
      activeContributions
    );
  }

  return reportData;
}
