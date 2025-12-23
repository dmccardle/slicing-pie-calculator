"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ContributorWithEquity, VestingState } from "@/types/slicingPie";
import { formatSlices, formatEquityPercentage, formatCurrency } from "@/utils/slicingPie";
import { useVesting } from "@/hooks/useVesting";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { VestingProgress } from "./VestingProgress";

const VESTING_STATE_LABELS: Record<VestingState, string> = {
  none: "Fully Vested",
  preCliff: "Pre-Cliff",
  vesting: "Vesting",
  fullyVested: "Fully Vested",
};

const VESTING_STATE_COLORS: Record<VestingState, string> = {
  none: "bg-green-100 text-green-800",
  preCliff: "bg-amber-100 text-amber-800",
  vesting: "bg-blue-100 text-blue-800",
  fullyVested: "bg-green-100 text-green-800",
};

interface ContributorCardProps {
  contributor: ContributorWithEquity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ContributorCard({
  contributor,
  onEdit,
  onDelete,
}: ContributorCardProps) {
  const { vestingEnabled } = useFeatureFlagsContext();
  const vestingStatus = useVesting(contributor, contributor.totalSlices);

  return (
    <Card className="relative">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {contributor.name}
              </h3>
              {!contributor.active && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Inactive
                </span>
              )}
              {vestingEnabled && vestingStatus && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    VESTING_STATE_COLORS[vestingStatus.state]
                  }`}
                >
                  {VESTING_STATE_LABELS[vestingStatus.state]}
                  {vestingStatus.state === "vesting" &&
                    ` (${Math.round(vestingStatus.percentVested)}%)`}
                </span>
              )}
            </div>
            {contributor.email && (
              <p className="mt-1 text-sm text-gray-500">{contributor.email}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(contributor.id)}
                aria-label={`Edit ${contributor.name}`}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(contributor.id)}
                aria-label={`Delete ${contributor.name}`}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Hourly Rate</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatCurrency(contributor.hourlyRate)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-gray-500">Total Slices</p>
            <p className="mt-1 font-semibold text-blue-600">
              {formatSlices(contributor.totalSlices)}
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-gray-500">Equity</p>
            <p className="mt-1 font-semibold text-green-600">
              {formatEquityPercentage(contributor.equityPercentage)}
            </p>
          </div>
        </div>

        {/* Vesting Details - Only when vesting is enabled and has vesting config */}
        {vestingEnabled && vestingStatus && contributor.vesting && (
          <div className="mt-3 rounded-lg border border-gray-200 p-3 space-y-3">
            <VestingProgress vestingStatus={vestingStatus} size="md" />
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Vested: </span>
                <span className="font-medium text-gray-900">
                  {formatSlices(vestingStatus.vestedSlices)} slices
                </span>
              </div>
              <div>
                <span className="text-gray-500">Unvested: </span>
                <span className="font-medium text-gray-900">
                  {formatSlices(vestingStatus.unvestedSlices)} slices
                </span>
              </div>
            </div>
            {vestingStatus.state === "preCliff" && vestingStatus.monthsUntilCliff > 0 && (
              <p className="text-xs text-amber-600">
                Cliff ends in {vestingStatus.monthsUntilCliff} month
                {vestingStatus.monthsUntilCliff !== 1 ? "s" : ""}
              </p>
            )}
            {vestingStatus.state === "vesting" && vestingStatus.monthsUntilFullVest > 0 && (
              <p className="text-xs text-blue-600">
                Fully vested in {vestingStatus.monthsUntilFullVest} month
                {vestingStatus.monthsUntilFullVest !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default ContributorCard;
