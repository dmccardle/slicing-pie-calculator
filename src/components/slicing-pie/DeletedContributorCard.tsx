"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import type { Contributor } from "@/types/slicingPie";
import { formatSlices, formatCurrency } from "@/utils/slicingPie";

interface DeletedContributorCardProps {
  contributor: Contributor;
  totalSlices: number;
  cascadeCount: number;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export function DeletedContributorCard({
  contributor,
  totalSlices,
  cascadeCount,
  onRestore,
  onPermanentDelete,
}: DeletedContributorCardProps) {
  const deletedDate = contributor.deletedAt
    ? new Date(contributor.deletedAt).toLocaleDateString()
    : "Unknown";

  return (
    <Card className="relative border-red-200 bg-red-50/30">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-600 line-through">
                {contributor.name}
              </h3>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                Deleted
              </span>
            </div>
            {contributor.email && (
              <p className="mt-1 text-sm text-gray-400">{contributor.email}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Deleted on {deletedDate}
            </p>
          </div>
          <div className="flex gap-2">
            {onRestore && (
              <button
                type="button"
                onClick={() => onRestore(contributor.id)}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                Restore
              </button>
            )}
            {onPermanentDelete && (
              <button
                type="button"
                onClick={() => onPermanentDelete(contributor.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-gray-100 p-3">
            <p className="text-xs text-gray-500">Hourly Rate</p>
            <p className="mt-1 font-semibold text-gray-500">
              {formatCurrency(contributor.hourlyRate)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <p className="text-xs text-gray-500">Total Slices</p>
            <p className="mt-1 font-semibold text-gray-500">
              {formatSlices(totalSlices)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <p className="text-xs text-gray-500">Cascade Deleted</p>
            <p className="mt-1 font-semibold text-gray-500">
              {cascadeCount} contribution{cascadeCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default DeletedContributorCard;
