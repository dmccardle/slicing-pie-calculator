"use client";

import React from "react";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { DeletedItemsList, ActivityLog } from "@/components/slicing-pie";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function DeletedPage() {
  const {
    getDeletedContributors,
    getDeletedContributions,
    getContributorById,
    restoreContributor,
    restoreContribution,
    activityEvents,
    isLoading,
  } = useSlicingPieContext();

  const deletedContributors = getDeletedContributors();
  const deletedContributions = getDeletedContributions();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const totalDeletedItems = deletedContributors.length + deletedContributions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <TrashIcon className="h-7 w-7 text-red-600" />
            Deleted Items
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {totalDeletedItems === 0
              ? "No deleted items"
              : `${totalDeletedItems} deleted item${totalDeletedItems !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeletedItemsList
            deletedContributors={deletedContributors}
            deletedContributions={deletedContributions}
            getContributorById={getContributorById}
            onRestoreContributor={restoreContributor}
            onRestoreContribution={restoreContribution}
          />
        </div>
        <div className="lg:col-span-1">
          <ActivityLog
            events={activityEvents}
            title="Deletion History"
            maxHeight="600px"
          />
        </div>
      </div>
    </div>
  );
}
