"use client";

import React from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Contribution, ContributionType } from "@/types/slicingPie";
import { formatSlices, formatContributionValue } from "@/utils/slicingPie";

interface ContributionRowProps {
  contribution: Contribution;
  contributorName: string;
  onEdit?: (contributionId: string) => void;
  onDelete?: (contributionId: string) => void;
}

const TYPE_LABELS: Record<ContributionType, string> = {
  time: "Time",
  cash: "Cash",
  "non-cash": "Non-Cash",
  idea: "Idea",
  relationship: "Relationship",
};

const TYPE_COLORS: Record<ContributionType, string> = {
  time: "bg-blue-100 text-blue-800",
  cash: "bg-green-100 text-green-800",
  "non-cash": "bg-purple-100 text-purple-800",
  idea: "bg-amber-100 text-amber-800",
  relationship: "bg-pink-100 text-pink-800",
};

export function ContributionRow({
  contribution,
  contributorName,
  onEdit,
  onDelete,
}: ContributionRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
        {new Date(contribution.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{contributorName}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${TYPE_COLORS[contribution.type]}`}
        >
          {TYPE_LABELS[contribution.type]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatContributionValue(contribution.type, contribution.value)}
        {contribution.description && (
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {contribution.description}
          </p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
        {formatSlices(contribution.slices)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(contribution.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit contribution"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(contribution.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete contribution"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ContributionRow;
