"use client";

import { useMemo, useCallback } from "react";
import type {
  Contributor,
  Contribution,
  ContributionType,
  ContributorWithEquity,
} from "@/types/slicingPie";
import {
  calculateSlices,
  getMultiplier,
  calculateAllEquity,
  getTotalSlices,
  getContributorTotalSlices,
  calculateEquityPercentage,
  formatSlices,
  formatEquityPercentage,
  formatCurrency,
  formatContributionValue,
  sortContributionsByDate,
} from "@/utils/slicingPie";

/**
 * Options for filtering contributions
 */
export interface ContributionFilters {
  contributorId?: string;
  type?: ContributionType;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Sort options for contributions
 */
export interface ContributionSort {
  field: "date" | "slices" | "value" | "type" | "contributorId";
  direction: "asc" | "desc";
}

/**
 * Hook for Slicing Pie calculations and utilities
 * Can be used independently of the context for calculation logic
 */
export function useSlicingPie(
  contributors: Contributor[],
  contributions: Contribution[]
) {
  /**
   * Contributors with computed equity values
   */
  const contributorsWithEquity = useMemo((): ContributorWithEquity[] => {
    return calculateAllEquity(contributors, contributions);
  }, [contributors, contributions]);

  /**
   * Total slices across all contributions
   */
  const totalSlices = useMemo((): number => {
    return getTotalSlices(contributions);
  }, [contributions]);

  /**
   * Get slices for a specific contributor
   */
  const getContributorSlices = useCallback(
    (contributorId: string): number => {
      return getContributorTotalSlices(contributorId, contributions);
    },
    [contributions]
  );

  /**
   * Get equity percentage for a specific contributor
   */
  const getContributorEquity = useCallback(
    (contributorId: string): number => {
      const contributorSlices = getContributorTotalSlices(
        contributorId,
        contributions
      );
      return calculateEquityPercentage(contributorSlices, totalSlices);
    },
    [contributions, totalSlices]
  );

  /**
   * Calculate slices for a new contribution (preview before saving)
   */
  const previewSlices = useCallback(
    (
      type: ContributionType,
      value: number,
      contributorId?: string
    ): { slices: number; multiplier: number } => {
      const contributor = contributorId
        ? contributors.find((c) => c.id === contributorId)
        : undefined;
      const multiplier = getMultiplier(type);
      const slices = calculateSlices(type, value, contributor?.hourlyRate);

      return { slices, multiplier };
    },
    [contributors]
  );

  /**
   * Filter contributions
   */
  const filterContributions = useCallback(
    (filters: ContributionFilters): Contribution[] => {
      return contributions.filter((c) => {
        if (filters.contributorId && c.contributorId !== filters.contributorId) {
          return false;
        }
        if (filters.type && c.type !== filters.type) {
          return false;
        }
        if (filters.dateFrom && c.date < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && c.date > filters.dateTo) {
          return false;
        }
        return true;
      });
    },
    [contributions]
  );

  /**
   * Sort contributions
   */
  const sortContributions = useCallback(
    (
      items: Contribution[],
      sort: ContributionSort
    ): Contribution[] => {
      const sorted = [...items].sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case "date":
            comparison =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case "slices":
            comparison = a.slices - b.slices;
            break;
          case "value":
            comparison = a.value - b.value;
            break;
          case "type":
            comparison = a.type.localeCompare(b.type);
            break;
          case "contributorId":
            comparison = a.contributorId.localeCompare(b.contributorId);
            break;
        }

        return sort.direction === "asc" ? comparison : -comparison;
      });

      return sorted;
    },
    []
  );

  /**
   * Get contributions for a specific contributor
   */
  const getContributorContributions = useCallback(
    (contributorId: string): Contribution[] => {
      return contributions.filter((c) => c.contributorId === contributorId);
    },
    [contributions]
  );

  /**
   * Get data for pie chart visualization
   */
  const pieChartData = useMemo(() => {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // emerald
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // violet
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#84CC16", // lime
      "#F97316", // orange
      "#6366F1", // indigo
    ];

    return contributorsWithEquity
      .filter((c) => c.totalSlices > 0)
      .map((contributor, index) => ({
        name: contributor.name,
        value: contributor.equityPercentage,
        slices: contributor.totalSlices,
        color: colors[index % colors.length],
      }));
  }, [contributorsWithEquity]);

  /**
   * Summary statistics
   */
  const summary = useMemo(() => {
    const activeContributors = contributors.filter((c) => c.active);
    const contributionsThisMonth = contributions.filter((c) => {
      const date = new Date(c.date);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    return {
      totalContributors: contributors.length,
      activeContributors: activeContributors.length,
      totalContributions: contributions.length,
      contributionsThisMonth: contributionsThisMonth.length,
      totalSlices,
    };
  }, [contributors, contributions, totalSlices]);

  return {
    // Computed data
    contributorsWithEquity,
    totalSlices,
    pieChartData,
    summary,

    // Calculation functions
    getContributorSlices,
    getContributorEquity,
    previewSlices,

    // Filtering and sorting
    filterContributions,
    sortContributions,
    getContributorContributions,

    // Formatting utilities
    formatSlices,
    formatEquityPercentage,
    formatCurrency,
    formatContributionValue,
    sortContributionsByDate,
  };
}

export default useSlicingPie;
