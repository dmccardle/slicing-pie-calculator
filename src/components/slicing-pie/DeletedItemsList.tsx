"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { DeletedContributorCard } from "./DeletedContributorCard";
import { DeletedContributionRow } from "./DeletedContributionRow";
import type { Contributor, Contribution } from "@/types/slicingPie";

interface DeletedItemsListProps {
  deletedContributors: Contributor[];
  deletedContributions: Contribution[];
  getContributorById: (id: string) => Contributor | undefined;
  onRestoreContributor?: (id: string) => void;
  onRestoreContribution?: (id: string) => void;
  onPermanentDeleteContributor?: (id: string) => void;
  onPermanentDeleteContribution?: (id: string) => void;
}

export function DeletedItemsList({
  deletedContributors,
  deletedContributions,
  getContributorById,
  onRestoreContributor,
  onRestoreContribution,
  onPermanentDeleteContributor,
  onPermanentDeleteContribution,
}: DeletedItemsListProps) {
  // Calculate slices and cascade counts for each deleted contributor
  const contributorStats = useMemo(() => {
    const stats = new Map<string, { totalSlices: number; cascadeCount: number }>();

    deletedContributors.forEach((contributor) => {
      // Find contributions that were cascade-deleted with this contributor
      const cascadeContributions = deletedContributions.filter(
        (c) => c.deletedWithParent === contributor.id
      );

      stats.set(contributor.id, {
        totalSlices: cascadeContributions.reduce((sum, c) => sum + c.slices, 0),
        cascadeCount: cascadeContributions.length,
      });
    });

    return stats;
  }, [deletedContributors, deletedContributions]);

  // Get independently deleted contributions (not cascade-deleted)
  const independentlyDeletedContributions = useMemo(() => {
    return deletedContributions.filter((c) => !c.deletedWithParent);
  }, [deletedContributions]);

  // Get cascade-deleted contributions (for display under contributors)
  const cascadeDeletedContributions = useMemo(() => {
    return deletedContributions.filter((c) => c.deletedWithParent);
  }, [deletedContributions]);

  const hasDeletedItems =
    deletedContributors.length > 0 || deletedContributions.length > 0;

  if (!hasDeletedItems) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Trash is empty
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Deleted contributors and contributions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Deleted Contributors Section */}
      {deletedContributors.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Deleted Contributors ({deletedContributors.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {deletedContributors.map((contributor) => {
              const stats = contributorStats.get(contributor.id) || {
                totalSlices: 0,
                cascadeCount: 0,
              };
              return (
                <DeletedContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  totalSlices={stats.totalSlices}
                  cascadeCount={stats.cascadeCount}
                  onRestore={onRestoreContributor}
                  onPermanentDelete={onPermanentDeleteContributor}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Cascade-Deleted Contributions (shown grouped by contributor) */}
      {cascadeDeletedContributions.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Cascade-Deleted Contributions ({cascadeDeletedContributions.length})
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            These contributions were deleted with their contributors. Restore the contributor to restore these.
          </p>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Contributor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Slices
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Deleted
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {cascadeDeletedContributions.map((contribution) => {
                    const contributor = getContributorById(contribution.contributorId);
                    return (
                      <DeletedContributionRow
                        key={contribution.id}
                        contribution={contribution}
                        contributorName={contributor?.name || "Unknown"}
                        onRestore={onRestoreContribution}
                        onPermanentDelete={onPermanentDeleteContribution}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      {/* Independently Deleted Contributions Section */}
      {independentlyDeletedContributions.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Deleted Contributions ({independentlyDeletedContributions.length})
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Contributor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Slices
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Deleted
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {independentlyDeletedContributions.map((contribution) => {
                    const contributor = getContributorById(contribution.contributorId);
                    return (
                      <DeletedContributionRow
                        key={contribution.id}
                        contribution={contribution}
                        contributorName={contributor?.name || "Unknown"}
                        onRestore={onRestoreContribution}
                        onPermanentDelete={onPermanentDeleteContribution}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

export default DeletedItemsList;
