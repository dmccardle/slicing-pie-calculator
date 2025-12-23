"use client";

import React from "react";
import type { Contribution, ContributionType } from "@/types/slicingPie";
import { formatSlices, formatContributionValue } from "@/utils/slicingPie";

interface DeletedContributionRowProps {
  contribution: Contribution;
  contributorName: string;
  onRestore?: (contributionId: string) => void;
  onPermanentDelete?: (contributionId: string) => void;
}

const TYPE_LABELS: Record<ContributionType, string> = {
  time: "Time",
  cash: "Cash",
  "non-cash": "Non-Cash",
  idea: "Idea",
  relationship: "Relationship",
};

export function DeletedContributionRow({
  contribution,
  contributorName,
  onRestore,
  onPermanentDelete,
}: DeletedContributionRowProps) {
  const deletedDate = contribution.deletedAt
    ? new Date(contribution.deletedAt).toLocaleDateString()
    : "Unknown";

  const isCascadeDeleted = !!contribution.deletedWithParent;

  return (
    <tr className="bg-red-50/30 hover:bg-red-50/50">
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 line-through">
        {new Date(contribution.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 line-through">
        {contributorName}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
          {TYPE_LABELS[contribution.type]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <span className="line-through">
          {formatContributionValue(contribution.type, contribution.value)}
        </span>
        {contribution.description && (
          <p className="text-xs text-gray-400 truncate max-w-[200px] line-through">
            {contribution.description}
          </p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-500 line-through">
        {formatSlices(contribution.slices)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        <div className="flex flex-col items-end">
          <span>{deletedDate}</span>
          {isCascadeDeleted && (
            <span className="text-xs text-amber-600">With contributor</span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {onRestore && !isCascadeDeleted && (
            <button
              type="button"
              onClick={() => onRestore(contribution.id)}
              className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100 transition-colors"
            >
              Restore
            </button>
          )}
          {onPermanentDelete && !isCascadeDeleted && (
            <button
              type="button"
              onClick={() => onPermanentDelete(contribution.id)}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
          {isCascadeDeleted && (
            <span className="text-xs text-gray-400 italic">
              Restore contributor
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default DeletedContributionRow;
