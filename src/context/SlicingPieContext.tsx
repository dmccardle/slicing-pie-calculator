"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEntities, type Entity } from "@/hooks/useEntities";
import type {
  Company,
  Contributor,
  Contribution,
  ContributorWithEquity,
} from "@/types/slicingPie";
import { DEFAULT_COMPANY } from "@/types/slicingPie";
import {
  calculateAllEquity,
  getTotalSlices,
  getMostRecentContribution,
} from "@/utils/slicingPie";
import {
  SAMPLE_COMPANY,
  SAMPLE_CONTRIBUTORS,
  SAMPLE_CONTRIBUTIONS,
} from "@/lib/sampleData";

/**
 * Slicing Pie context value type
 */
interface SlicingPieContextValue {
  // Company
  company: Company;
  updateCompany: (updates: Partial<Company>) => void;

  // Contributors
  contributors: Contributor[];
  contributorsWithEquity: ContributorWithEquity[];
  addContributor: (
    data: Omit<Contributor, "id" | "createdAt" | "updatedAt">
  ) => Contributor;
  updateContributor: (
    id: string,
    data: Partial<Omit<Contributor, "id" | "createdAt" | "updatedAt">>
  ) => Contributor | null;
  removeContributor: (id: string) => boolean;
  getContributorById: (id: string) => Contributor | undefined;

  // Contributions
  contributions: Contribution[];
  addContribution: (
    data: Omit<Contribution, "id" | "createdAt" | "updatedAt">
  ) => Contribution;
  updateContribution: (
    id: string,
    data: Partial<Omit<Contribution, "id" | "createdAt" | "updatedAt">>
  ) => Contribution | null;
  removeContribution: (id: string) => boolean;
  getContributionById: (id: string) => Contribution | undefined;

  // Computed values
  totalSlices: number;
  mostRecentContribution: Contribution | null;

  // Data management
  loadSampleData: () => void;
  clearAllData: () => void;
  hasData: boolean;
  hasSampleData: boolean;

  // Loading state
  isLoading: boolean;
}

const SlicingPieContext = createContext<SlicingPieContextValue | null>(null);

/**
 * Slicing Pie context provider
 */
export function SlicingPieProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Company state
  const [company, setCompany, { isLoading: companyLoading }] =
    useLocalStorage<Company>("slicingPie_company", DEFAULT_COMPANY);

  // Contributors using useEntities
  const {
    entities: contributors,
    add: addContributorEntity,
    update: updateContributorEntity,
    remove: removeContributorEntity,
    getById: getContributorById,
    clear: clearContributors,
    isLoading: contributorsLoading,
  } = useEntities<Entity<Omit<Contributor, "id" | "createdAt" | "updatedAt">>>(
    "slicingPie_contributors"
  );

  // Contributions using useEntities
  const {
    entities: contributions,
    add: addContributionEntity,
    update: updateContributionEntity,
    remove: removeContributionEntity,
    getById: getContributionById,
    clear: clearContributions,
    isLoading: contributionsLoading,
  } = useEntities<Entity<Omit<Contribution, "id" | "createdAt" | "updatedAt">>>(
    "slicingPie_contributions"
  );

  // Update company
  const updateCompany = useCallback(
    (updates: Partial<Company>) => {
      setCompany((prev) => ({ ...prev, ...updates }));
    },
    [setCompany]
  );

  // Type-safe contributor operations
  const addContributor = useCallback(
    (data: Omit<Contributor, "id" | "createdAt" | "updatedAt">) => {
      return addContributorEntity(data) as unknown as Contributor;
    },
    [addContributorEntity]
  );

  const updateContributor = useCallback(
    (
      id: string,
      data: Partial<Omit<Contributor, "id" | "createdAt" | "updatedAt">>
    ) => {
      return updateContributorEntity(id, data) as unknown as Contributor | null;
    },
    [updateContributorEntity]
  );

  const removeContributor = useCallback(
    (id: string) => {
      return removeContributorEntity(id);
    },
    [removeContributorEntity]
  );

  // Type-safe contribution operations
  const addContribution = useCallback(
    (data: Omit<Contribution, "id" | "createdAt" | "updatedAt">) => {
      return addContributionEntity(data) as unknown as Contribution;
    },
    [addContributionEntity]
  );

  const updateContribution = useCallback(
    (
      id: string,
      data: Partial<Omit<Contribution, "id" | "createdAt" | "updatedAt">>
    ) => {
      return updateContributionEntity(
        id,
        data
      ) as unknown as Contribution | null;
    },
    [updateContributionEntity]
  );

  const removeContribution = useCallback(
    (id: string) => {
      return removeContributionEntity(id);
    },
    [removeContributionEntity]
  );

  // Computed values
  const contributorsWithEquity = useMemo(() => {
    return calculateAllEquity(
      contributors as unknown as Contributor[],
      contributions as unknown as Contribution[]
    );
  }, [contributors, contributions]);

  const totalSlices = useMemo(() => {
    return getTotalSlices(contributions as unknown as Contribution[]);
  }, [contributions]);

  const mostRecentContribution = useMemo(() => {
    return getMostRecentContribution(contributions as unknown as Contribution[]);
  }, [contributions]);

  const hasData = contributors.length > 0 || contributions.length > 0;

  const hasSampleData = useMemo(() => {
    const sampleIds = SAMPLE_CONTRIBUTORS.map((c) => c.id);
    return contributors.some((c) => sampleIds.includes(c.id));
  }, [contributors]);

  // Load sample data
  const loadSampleData = useCallback(() => {
    setCompany(SAMPLE_COMPANY);

    // Clear existing data first
    clearContributors();
    clearContributions();

    // Use setTimeout to ensure state is cleared before adding new data
    setTimeout(() => {
      // Add sample contributors
      SAMPLE_CONTRIBUTORS.forEach((contributor) => {
        addContributorEntity({
          ...contributor,
        } as Entity<Omit<Contributor, "id" | "createdAt" | "updatedAt">>);
      });

      // Add sample contributions
      SAMPLE_CONTRIBUTIONS.forEach((contribution) => {
        addContributionEntity({
          ...contribution,
        } as Entity<Omit<Contribution, "id" | "createdAt" | "updatedAt">>);
      });
    }, 0);
  }, [
    setCompany,
    clearContributors,
    clearContributions,
    addContributorEntity,
    addContributionEntity,
  ]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setCompany(DEFAULT_COMPANY);
    clearContributors();
    clearContributions();
  }, [setCompany, clearContributors, clearContributions]);

  const isLoading = companyLoading || contributorsLoading || contributionsLoading;

  const value = useMemo(
    () => ({
      company,
      updateCompany,
      contributors: contributors as unknown as Contributor[],
      contributorsWithEquity,
      addContributor,
      updateContributor,
      removeContributor,
      getContributorById: getContributorById as (
        id: string
      ) => Contributor | undefined,
      contributions: contributions as unknown as Contribution[],
      addContribution,
      updateContribution,
      removeContribution,
      getContributionById: getContributionById as (
        id: string
      ) => Contribution | undefined,
      totalSlices,
      mostRecentContribution,
      loadSampleData,
      clearAllData,
      hasData,
      hasSampleData,
      isLoading,
    }),
    [
      company,
      updateCompany,
      contributors,
      contributorsWithEquity,
      addContributor,
      updateContributor,
      removeContributor,
      getContributorById,
      contributions,
      addContribution,
      updateContribution,
      removeContribution,
      getContributionById,
      totalSlices,
      mostRecentContribution,
      loadSampleData,
      clearAllData,
      hasData,
      hasSampleData,
      isLoading,
    ]
  );

  return (
    <SlicingPieContext.Provider value={value}>
      {children}
    </SlicingPieContext.Provider>
  );
}

/**
 * Hook to access Slicing Pie context
 */
export function useSlicingPieContext(): SlicingPieContextValue {
  const context = useContext(SlicingPieContext);
  if (!context) {
    throw new Error(
      "useSlicingPieContext must be used within a SlicingPieProvider"
    );
  }
  return context;
}

export default SlicingPieContext;
