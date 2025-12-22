/**
 * Vesting calculation utilities
 * Implements linear (straight-line) vesting after cliff period
 */

import type { Contributor, VestingStatus, VestingState, VestingConfig } from '@/types/slicingPie';

/**
 * Calculate the difference in months between two dates
 * @param startDate - Start date (ISO string YYYY-MM-DD)
 * @param endDate - End date (ISO string YYYY-MM-DD)
 * @returns Number of months (can be negative if endDate is before startDate)
 */
export function calculateMonthsDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  // Total months, adjusting for partial months
  let totalMonths = yearDiff * 12 + monthDiff;

  // If end day is before start day, we haven't completed the current month
  if (dayDiff < 0) {
    totalMonths -= 1;
  }

  return totalMonths;
}

/**
 * Get the cliff date for a contributor
 * @param vesting - Vesting configuration
 * @returns ISO date string of cliff date, or null if no cliff
 */
export function getCliffDate(vesting: VestingConfig): string | null {
  if (vesting.cliffMonths === 0) {
    return null;
  }

  const startDate = new Date(vesting.startDate);
  startDate.setMonth(startDate.getMonth() + vesting.cliffMonths);
  return startDate.toISOString().split('T')[0];
}

/**
 * Get the full vest date for a contributor
 * @param vesting - Vesting configuration
 * @returns ISO date string of full vest date
 */
export function getFullVestDate(vesting: VestingConfig): string {
  const startDate = new Date(vesting.startDate);
  startDate.setMonth(startDate.getMonth() + vesting.vestingMonths);
  return startDate.toISOString().split('T')[0];
}

/**
 * Calculate vesting status for a contributor at a given date
 * Uses linear (straight-line) vesting after cliff
 *
 * @param contributor - The contributor to calculate vesting for
 * @param totalSlices - Total slices the contributor has earned
 * @param asOfDate - Date to calculate vesting as of (ISO string, defaults to today)
 * @returns VestingStatus with all computed values
 */
export function calculateVestingStatus(
  contributor: Contributor,
  totalSlices: number,
  asOfDate?: string
): VestingStatus {
  const currentDate = asOfDate || new Date().toISOString().split('T')[0];

  // No vesting config = 100% vested (legacy/backward compatible)
  if (!contributor.vesting) {
    return {
      state: 'none',
      percentVested: 100,
      vestedSlices: totalSlices,
      unvestedSlices: 0,
      cliffDate: null,
      fullVestDate: null,
      monthsUntilCliff: 0,
      monthsUntilFullVest: 0,
    };
  }

  const { startDate, cliffMonths, vestingMonths } = contributor.vesting;
  const cliffDate = getCliffDate(contributor.vesting);
  const fullVestDate = getFullVestDate(contributor.vesting);

  const monthsElapsed = calculateMonthsDifference(startDate, currentDate);

  // Before start date
  if (monthsElapsed < 0) {
    return {
      state: 'preCliff',
      percentVested: 0,
      vestedSlices: 0,
      unvestedSlices: totalSlices,
      cliffDate,
      fullVestDate,
      monthsUntilCliff: cliffMonths - monthsElapsed,
      monthsUntilFullVest: vestingMonths - monthsElapsed,
    };
  }

  // Pre-cliff period
  if (monthsElapsed < cliffMonths) {
    return {
      state: 'preCliff',
      percentVested: 0,
      vestedSlices: 0,
      unvestedSlices: totalSlices,
      cliffDate,
      fullVestDate,
      monthsUntilCliff: cliffMonths - monthsElapsed,
      monthsUntilFullVest: vestingMonths - monthsElapsed,
    };
  }

  // Fully vested
  if (monthsElapsed >= vestingMonths) {
    return {
      state: 'fullyVested',
      percentVested: 100,
      vestedSlices: totalSlices,
      unvestedSlices: 0,
      cliffDate,
      fullVestDate,
      monthsUntilCliff: 0,
      monthsUntilFullVest: 0,
    };
  }

  // Vesting in progress (post-cliff, pre-full vest)
  // Linear vesting: percent = monthsElapsed / vestingMonths
  const percentVested = Math.min(100, (monthsElapsed / vestingMonths) * 100);
  const vestedSlices = Math.floor(totalSlices * (percentVested / 100));

  return {
    state: 'vesting',
    percentVested: Math.round(percentVested * 100) / 100, // Round to 2 decimal places
    vestedSlices,
    unvestedSlices: totalSlices - vestedSlices,
    cliffDate,
    fullVestDate,
    monthsUntilCliff: 0,
    monthsUntilFullVest: vestingMonths - monthsElapsed,
  };
}

/**
 * Calculate projected vesting status at a future date
 * @param contributor - The contributor
 * @param totalSlices - Total slices earned
 * @param targetDate - Target date for projection (ISO string)
 * @returns VestingStatus at the target date
 */
export function calculateProjectedVesting(
  contributor: Contributor,
  totalSlices: number,
  targetDate: string
): VestingStatus {
  return calculateVestingStatus(contributor, totalSlices, targetDate);
}

/**
 * Get vested equity data for chart visualization
 * Returns data suitable for Recharts PieChart with vested/unvested breakdown
 */
export interface VestedEquityDataItem {
  contributorId: string;
  contributorName: string;
  vestedSlices: number;
  unvestedSlices: number;
  totalSlices: number;
  percentVested: number;
  vestingState: VestingState;
}

export function getVestedEquityData(
  contributors: Contributor[],
  contributorSlices: Map<string, number>,
  asOfDate?: string
): VestedEquityDataItem[] {
  return contributors.map((contributor) => {
    const totalSlices = contributorSlices.get(contributor.id) || 0;
    const status = calculateVestingStatus(contributor, totalSlices, asOfDate);

    return {
      contributorId: contributor.id,
      contributorName: contributor.name,
      vestedSlices: status.vestedSlices,
      unvestedSlices: status.unvestedSlices,
      totalSlices,
      percentVested: status.percentVested,
      vestingState: status.state,
    };
  });
}

/**
 * Get summary statistics for vesting across all contributors
 */
export interface VestingSummary {
  totalVestedSlices: number;
  totalUnvestedSlices: number;
  totalSlices: number;
  overallPercentVested: number;
  nextCliffDate: string | null;
  nextFullVestDate: string | null;
  contributorsPreCliff: number;
  contributorsVesting: number;
  contributorsFullyVested: number;
}

export function getVestingSummary(
  contributors: Contributor[],
  contributorSlices: Map<string, number>,
  asOfDate?: string
): VestingSummary {
  let totalVestedSlices = 0;
  let totalUnvestedSlices = 0;
  let nextCliffDate: string | null = null;
  let nextFullVestDate: string | null = null;
  let contributorsPreCliff = 0;
  let contributorsVesting = 0;
  let contributorsFullyVested = 0;

  const currentDate = asOfDate || new Date().toISOString().split('T')[0];

  for (const contributor of contributors) {
    const totalSlices = contributorSlices.get(contributor.id) || 0;
    const status = calculateVestingStatus(contributor, totalSlices, asOfDate);

    totalVestedSlices += status.vestedSlices;
    totalUnvestedSlices += status.unvestedSlices;

    // Count by state
    if (status.state === 'preCliff') {
      contributorsPreCliff++;
      // Track next cliff date
      if (status.cliffDate && status.cliffDate > currentDate) {
        if (!nextCliffDate || status.cliffDate < nextCliffDate) {
          nextCliffDate = status.cliffDate;
        }
      }
    } else if (status.state === 'vesting') {
      contributorsVesting++;
    } else if (status.state === 'fullyVested' || status.state === 'none') {
      contributorsFullyVested++;
    }

    // Track next full vest date
    if (status.fullVestDate && status.fullVestDate > currentDate) {
      if (!nextFullVestDate || status.fullVestDate < nextFullVestDate) {
        nextFullVestDate = status.fullVestDate;
      }
    }
  }

  const totalSlices = totalVestedSlices + totalUnvestedSlices;

  return {
    totalVestedSlices,
    totalUnvestedSlices,
    totalSlices,
    overallPercentVested: totalSlices > 0
      ? Math.round((totalVestedSlices / totalSlices) * 10000) / 100
      : 100,
    nextCliffDate,
    nextFullVestDate,
    contributorsPreCliff,
    contributorsVesting,
    contributorsFullyVested,
  };
}
