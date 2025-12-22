/**
 * Slicing Pie Calculation Utilities
 * Implements the Slicing Pie equity model by Mike Moyer
 */

import {
  ContributionType,
  Contribution,
  Contributor,
  ContributorWithEquity,
} from '@/types/slicingPie';

/**
 * Multipliers for each contribution type
 * Based on the Slicing Pie model
 */
export const MULTIPLIERS: Record<ContributionType, number> = {
  time: 2,
  cash: 4,
  'non-cash': 2,
  idea: 1,
  relationship: 1,
};

/**
 * Calculate slices for a contribution
 * @param type - The contribution type
 * @param value - The raw value (hours, dollars, etc.)
 * @param hourlyRate - The contributor's hourly rate (required for time contributions)
 * @returns The calculated number of slices
 */
export function calculateSlices(
  type: ContributionType,
  value: number,
  hourlyRate?: number
): number {
  const multiplier = MULTIPLIERS[type];

  if (type === 'time') {
    // Time: hours × hourlyRate × 2
    const rate = hourlyRate ?? 0;
    return value * rate * multiplier;
  }

  // All other types: value × multiplier
  return value * multiplier;
}

/**
 * Get the multiplier for a contribution type
 */
export function getMultiplier(type: ContributionType): number {
  return MULTIPLIERS[type];
}

/**
 * Calculate equity percentage
 * @param contributorSlices - Slices for a single contributor
 * @param totalSlices - Total slices across all contributors
 * @returns Equity percentage (0-100)
 */
export function calculateEquityPercentage(
  contributorSlices: number,
  totalSlices: number
): number {
  if (totalSlices === 0) return 0;
  return (contributorSlices / totalSlices) * 100;
}

/**
 * Get total slices for a contributor
 */
export function getContributorTotalSlices(
  contributorId: string,
  contributions: Contribution[]
): number {
  return contributions
    .filter((c) => c.contributorId === contributorId)
    .reduce((sum, c) => sum + c.slices, 0);
}

/**
 * Get total slices across all contributions
 */
export function getTotalSlices(contributions: Contribution[]): number {
  return contributions.reduce((sum, c) => sum + c.slices, 0);
}

/**
 * Calculate equity for all contributors
 */
export function calculateAllEquity(
  contributors: Contributor[],
  contributions: Contribution[]
): ContributorWithEquity[] {
  const totalSlices = getTotalSlices(contributions);

  return contributors.map((contributor) => {
    const contributorSlices = getContributorTotalSlices(
      contributor.id,
      contributions
    );
    const equityPercentage = calculateEquityPercentage(
      contributorSlices,
      totalSlices
    );

    return {
      ...contributor,
      totalSlices: contributorSlices,
      equityPercentage,
    };
  });
}

/**
 * Format slices for display (with thousands separator)
 */
export function formatSlices(slices: number): string {
  return slices.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
}

/**
 * Format equity percentage for display
 */
export function formatEquityPercentage(percentage: number): string {
  return percentage.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + '%';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format value based on contribution type
 */
export function formatContributionValue(
  type: ContributionType,
  value: number
): string {
  if (type === 'time') {
    return `${value} hr${value !== 1 ? 's' : ''}`;
  }
  return formatCurrency(value);
}

/**
 * Get the most recent contribution
 */
export function getMostRecentContribution(
  contributions: Contribution[]
): Contribution | null {
  if (contributions.length === 0) return null;

  return contributions.reduce((latest, current) => {
    return new Date(current.createdAt) > new Date(latest.createdAt)
      ? current
      : latest;
  });
}

/**
 * Sort contributions by date (newest first)
 */
export function sortContributionsByDate(
  contributions: Contribution[],
  ascending = false
): Contribution[] {
  return [...contributions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
