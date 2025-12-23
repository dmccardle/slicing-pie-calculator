"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEntities, type Entity } from "@/hooks/useEntities";
import { useActivityLog } from "@/hooks/useActivityLog";
import type { ActivityEvent } from "@/types/slicingPie";
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
  getVestedEquityData,
  getVestingSummary,
  type VestedEquityDataItem,
  type VestingSummary,
} from "@/utils/vesting";
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
  getDeletedContributors: () => Contributor[];

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
  getDeletedContributions: () => Contribution[];
  restoreContributor: (id: string) => boolean;
  restoreContribution: (id: string) => boolean;

  // Computed values
  totalSlices: number;
  mostRecentContribution: Contribution | null;

  // Vesting computed values
  vestedEquityData: VestedEquityDataItem[];
  vestingSummary: VestingSummary;

  // Data management
  loadSampleData: () => void;
  clearAllData: () => void;
  importData: (data: {
    company: Company;
    contributors: Contributor[];
    contributions: Contribution[];
  }) => void;
  hasData: boolean;
  hasSampleData: boolean;

  // Activity log
  activityEvents: ActivityEvent[];
  getRecentActivityEvents: (limit?: number) => ActivityEvent[];

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

  // Activity log
  const {
    events: activityEvents,
    addEvent: addActivityEvent,
    getRecentEvents: getRecentActivityEvents,
  } = useActivityLog();

  // Contributors using useEntities
  const {
    entities: allContributors,
    add: addContributorEntity,
    update: updateContributorEntity,
    remove: _removeContributorEntity,
    softDelete: softDeleteContributor,
    restore: restoreContributorEntity,
    getById: getContributorById,
    getActive: getActiveContributors,
    getDeleted: getDeletedContributors,
    clear: clearContributors,
    setAll: setAllContributors,
    isLoading: contributorsLoading,
  } = useEntities<Entity<Omit<Contributor, "id" | "createdAt" | "updatedAt">>>(
    "slicingPie_contributors"
  );

  // Contributions using useEntities
  const {
    entities: allContributions,
    add: addContributionEntity,
    update: updateContributionEntity,
    remove: _removeContributionEntity,
    softDelete: softDeleteContribution,
    restore: restoreContributionEntity,
    getById: getContributionById,
    getActive: getActiveContributions,
    getDeleted: getDeletedContributions,
    clear: clearContributions,
    setAll: setAllContributions,
    isLoading: contributionsLoading,
  } = useEntities<Entity<Omit<Contribution, "id" | "createdAt" | "updatedAt">>>(
    "slicingPie_contributions"
  );

  // Filter to get only active (non-deleted) entities
  const contributors = useMemo(() => getActiveContributors(), [getActiveContributors]);
  const contributions = useMemo(() => getActiveContributions(), [getActiveContributions]);

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
      // Get contributor info before deletion for logging
      const contributor = allContributors.find((c) => c.id === id);
      if (!contributor) return false;

      // Soft delete the contributor
      const deleted = softDeleteContributor(id);

      if (deleted) {
        // Cascade: soft delete all contributions for this contributor
        const contributorContributions = allContributions.filter(
          (c) => c.contributorId === id && !c.deletedAt
        );
        const totalSlices = contributorContributions.reduce((sum, c) => sum + c.slices, 0);

        contributorContributions.forEach((contribution) => {
          softDeleteContribution(contribution.id, id); // Pass contributor ID as parent
        });

        // Log activity event
        addActivityEvent(
          "deleted",
          "contributor",
          id,
          contributor.name,
          totalSlices,
          contributorContributions.length
        );
      }

      return deleted;
    },
    [softDeleteContributor, softDeleteContribution, allContributions, allContributors, addActivityEvent]
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
      // Get contribution info before deletion for logging
      const contribution = allContributions.find((c) => c.id === id);
      if (!contribution) return false;

      // Soft delete individual contribution (no parent - not cascade deleted)
      const deleted = softDeleteContribution(id);

      if (deleted) {
        // Get contributor name for the log
        const contributor = allContributors.find((c) => c.id === contribution.contributorId);
        const entityName = `${contribution.type} contribution` + (contributor ? ` (${contributor.name})` : "");

        // Log activity event
        addActivityEvent(
          "deleted",
          "contribution",
          id,
          entityName,
          contribution.slices
        );
      }

      return deleted;
    },
    [softDeleteContribution, allContributions, allContributors, addActivityEvent]
  );

  // Restore a contributor and cascade-restore their contributions
  const restoreContributor = useCallback(
    (id: string) => {
      // Get contributor info before restoration for logging
      const contributor = allContributors.find((c) => c.id === id);
      if (!contributor) return false;

      const restored = restoreContributorEntity(id);

      if (restored) {
        // Cascade: restore all contributions that were deleted with this contributor
        const cascadeContributions = allContributions.filter(
          (c) => c.deletedWithParent === id
        );
        const totalSlices = cascadeContributions.reduce((sum, c) => sum + c.slices, 0);

        cascadeContributions.forEach((contribution) => {
          restoreContributionEntity(contribution.id);
        });

        // Log activity event
        addActivityEvent(
          "restored",
          "contributor",
          id,
          contributor.name,
          totalSlices,
          cascadeContributions.length
        );
      }

      return restored;
    },
    [restoreContributorEntity, restoreContributionEntity, allContributions, allContributors, addActivityEvent]
  );

  // Restore an individual contribution
  const restoreContribution = useCallback(
    (id: string) => {
      // Get contribution info before restoration for logging
      const contribution = allContributions.find((c) => c.id === id);
      if (!contribution) return false;

      const restored = restoreContributionEntity(id);

      if (restored) {
        // Get contributor name for the log
        const contributor = allContributors.find((c) => c.id === contribution.contributorId);
        const entityName = `${contribution.type} contribution` + (contributor ? ` (${contributor.name})` : "");

        // Log activity event
        addActivityEvent(
          "restored",
          "contribution",
          id,
          entityName,
          contribution.slices
        );
      }

      return restored;
    },
    [restoreContributionEntity, allContributions, allContributors, addActivityEvent]
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

  // Build contributor slices map for vesting calculations
  const contributorSlicesMap = useMemo(() => {
    const map = new Map<string, number>();
    contributorsWithEquity.forEach((c) => {
      map.set(c.id, c.totalSlices);
    });
    return map;
  }, [contributorsWithEquity]);

  // Vesting computed values
  const vestedEquityData = useMemo(() => {
    return getVestedEquityData(
      contributors as unknown as Contributor[],
      contributorSlicesMap
    );
  }, [contributors, contributorSlicesMap]);

  const vestingSummary = useMemo(() => {
    return getVestingSummary(
      contributors as unknown as Contributor[],
      contributorSlicesMap
    );
  }, [contributors, contributorSlicesMap]);

  const hasData = allContributors.length > 0 || allContributions.length > 0;

  const hasSampleData = useMemo(() => {
    const sampleIds = SAMPLE_CONTRIBUTORS.map((c) => c.id);
    return allContributors.some((c) => sampleIds.includes(c.id));
  }, [allContributors]);

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

  // Import data (bulk replace to avoid race conditions)
  const importData = useCallback(
    (data: {
      company: Company;
      contributors: Contributor[];
      contributions: Contribution[];
    }) => {
      // Set company directly
      setCompany(data.company);

      // Transform contributors to include timestamps if missing
      const now = new Date().toISOString();
      const contributorsWithTimestamps = data.contributors.map((c) => ({
        ...c,
        id: c.id || `contributor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: c.createdAt || now,
        updatedAt: c.updatedAt || now,
      })) as Entity<Omit<Contributor, "id" | "createdAt" | "updatedAt">>[];

      // Transform contributions to include timestamps if missing
      const contributionsWithTimestamps = data.contributions.map((c) => ({
        ...c,
        id: c.id || `contribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: c.createdAt || now,
        updatedAt: c.updatedAt || now,
      })) as Entity<Omit<Contribution, "id" | "createdAt" | "updatedAt">>[];

      // Bulk set all entities at once (avoids race condition)
      setAllContributors(contributorsWithTimestamps);
      setAllContributions(contributionsWithTimestamps);
    },
    [setCompany, setAllContributors, setAllContributions]
  );

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
      getDeletedContributors: getDeletedContributors as () => Contributor[],
      contributions: contributions as unknown as Contribution[],
      addContribution,
      updateContribution,
      removeContribution,
      getContributionById: getContributionById as (
        id: string
      ) => Contribution | undefined,
      getDeletedContributions: getDeletedContributions as () => Contribution[],
      restoreContributor,
      restoreContribution,
      totalSlices,
      mostRecentContribution,
      vestedEquityData,
      vestingSummary,
      loadSampleData,
      clearAllData,
      importData,
      hasData,
      hasSampleData,
      activityEvents,
      getRecentActivityEvents,
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
      getDeletedContributors,
      contributions,
      addContribution,
      updateContribution,
      removeContribution,
      getContributionById,
      getDeletedContributions,
      restoreContributor,
      restoreContribution,
      totalSlices,
      mostRecentContribution,
      vestedEquityData,
      vestingSummary,
      loadSampleData,
      clearAllData,
      importData,
      hasData,
      hasSampleData,
      activityEvents,
      getRecentActivityEvents,
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
