"use client";

import { useMemo } from "react";
import type { Contributor, VestingStatus } from "@/types/slicingPie";
import { calculateVestingStatus } from "@/utils/vesting";

/**
 * Hook to compute vesting status for a contributor
 *
 * @param contributor - The contributor to calculate vesting for
 * @param totalSlices - Total slices the contributor has earned
 * @param asOfDate - Optional date to calculate vesting as of (defaults to today)
 * @returns VestingStatus with all computed values
 */
export function useVesting(
  contributor: Contributor | null | undefined,
  totalSlices: number,
  asOfDate?: string
): VestingStatus | null {
  return useMemo(() => {
    if (!contributor) return null;
    return calculateVestingStatus(contributor, totalSlices, asOfDate);
  }, [contributor, totalSlices, asOfDate]);
}

export default useVesting;
