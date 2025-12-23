"use client";

import { useState, useMemo } from "react";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Form/Toggle";
import { DateSelector } from "@/components/projections/DateSelector";
import { ProjectionChart } from "@/components/projections/ProjectionChart";
import { VestingProgress } from "@/components/slicing-pie/VestingProgress";
import {
  getVestedEquityData,
  getVestingSummary,
  calculateVestingStatus,
} from "@/utils/vesting";
import { formatSlices, formatEquityPercentage } from "@/utils/slicingPie";
import type { VestingState } from "@/types/slicingPie";
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

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

export default function ProjectionsPage() {
  const { contributors, contributorsWithEquity, isLoading } = useSlicingPieContext();
  const { vestingEnabled } = useFeatureFlagsContext();

  // Selected projection date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Toggle for showing unvested portions
  const [showUnvested, setShowUnvested] = useState(false);

  // Build contributor slices map
  const contributorSlicesMap = useMemo(() => {
    const map = new Map<string, number>();
    contributorsWithEquity.forEach((c) => {
      map.set(c.id, c.totalSlices);
    });
    return map;
  }, [contributorsWithEquity]);

  // Calculate projected vesting data
  const projectedData = useMemo(() => {
    return getVestedEquityData(contributors, contributorSlicesMap, selectedDate);
  }, [contributors, contributorSlicesMap, selectedDate]);

  // Calculate summary stats
  const summary = useMemo(() => {
    return getVestingSummary(contributors, contributorSlicesMap, selectedDate);
  }, [contributors, contributorSlicesMap, selectedDate]);

  // If vesting not enabled, redirect or show message
  if (!vestingEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projections</h1>
          <p className="mt-1 text-sm text-gray-600">
            View future equity distribution based on vesting schedules
          </p>
        </div>

        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500">
              Vesting features are disabled. Enable them in{" "}
              <a href="/settings" className="text-blue-600 hover:underline">
                Settings
              </a>{" "}
              to view projections.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <ArrowTrendingUpIcon className="h-7 w-7 text-blue-600" />
          Projections
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          View future equity distribution based on vesting schedules
        </p>
        <div className="mt-4">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Projected Equity Distribution
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show unvested</span>
              <Toggle
                checked={showUnvested}
                onChange={setShowUnvested}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {projectedData.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No contributors with equity. Add contributors and contributions to see projections.
            </p>
          ) : (
            <ProjectionChart data={projectedData} showUnvested={showUnvested} />
          )}
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className={`grid gap-4 ${showUnvested ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
        <Card>
          <CardBody className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <span aria-hidden="true">🍕</span>
              {showUnvested ? "Vested Slices" : "Total Slices"}
            </p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {formatSlices(showUnvested ? summary.totalVestedSlices : summary.totalVestedSlices)}
            </p>
            <p className="text-xs text-gray-400">slices</p>
          </CardBody>
        </Card>
        {showUnvested && (
          <Card>
            <CardBody className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <span aria-hidden="true">⏳</span>
                Unvested Slices
              </p>
              <p className="mt-1 text-xl font-bold text-amber-600">
                {formatSlices(summary.totalUnvestedSlices)}
              </p>
              <p className="text-xs text-gray-400">slices</p>
            </CardBody>
          </Card>
        )}
        <Card>
          <CardBody className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <UsersIcon className="h-4 w-4" />
              {showUnvested ? "Percent Vested" : "Contributors"}
            </p>
            {showUnvested ? (
              <p className="mt-1 text-xl font-bold text-blue-600">
                {formatEquityPercentage(summary.overallPercentVested)}
              </p>
            ) : (
              <p className="mt-1 text-xl font-bold text-blue-600">
                {projectedData.filter(d => d.vestedSlices > 0).length}
              </p>
            )}
            {!showUnvested && (
              <p className="text-xs text-gray-400">with vested equity</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <SignalIcon className="h-4 w-4" />
              Status
            </p>
            <div className="mt-1 flex justify-center gap-1 flex-wrap">
              {summary.contributorsPreCliff > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  {summary.contributorsPreCliff} in cliff
                </span>
              )}
              {summary.contributorsVesting > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {summary.contributorsVesting} vesting
                </span>
              )}
              {summary.contributorsFullyVested > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {summary.contributorsFullyVested} vested
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming Dates */}
      {(summary.nextCliffDate || summary.nextFullVestDate) && (
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-6 text-sm">
              {summary.nextCliffDate && (
                <div>
                  <span className="text-gray-500">Next cliff ends: </span>
                  <span className="font-medium text-amber-600">
                    {new Date(summary.nextCliffDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {summary.nextFullVestDate && (
                <div>
                  <span className="text-gray-500">Next full vest: </span>
                  <span className="font-medium text-green-600">
                    {new Date(summary.nextFullVestDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Contributor Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {showUnvested ? "Contributor Vesting Status" : "Vested Equity by Contributor"}
          </h2>
        </CardHeader>
        <CardBody>
          {projectedData.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No contributors to display.</p>
          ) : (
            <div className="space-y-4">
              {projectedData
                .filter((item) => showUnvested || item.vestedSlices > 0)
                .map((item) => {
                  const contributor = contributors.find((c) => c.id === item.contributorId);
                  const vestingStatus = contributor
                    ? calculateVestingStatus(contributor, item.totalSlices, selectedDate)
                    : null;

                  // Calculate equity % based on vested slices only when not showing unvested
                  const totalVestedSlices = summary.totalVestedSlices;
                  const vestedEquityPercent = totalVestedSlices > 0
                    ? (item.vestedSlices / totalVestedSlices) * 100
                    : 0;

                  return (
                    <div
                      key={item.contributorId}
                      className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {item.contributorName}
                          </h3>
                          {showUnvested && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                VESTING_STATE_COLORS[item.vestingState]
                              }`}
                            >
                              {VESTING_STATE_LABELS[item.vestingState]}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {showUnvested
                            ? `${formatSlices(item.vestedSlices)} vested / ${formatSlices(item.totalSlices)} total`
                            : `${formatSlices(item.vestedSlices)} slices`}
                        </p>
                      </div>
                      {showUnvested && (
                        <div className="w-full md:w-48">
                          {vestingStatus && (
                            <VestingProgress vestingStatus={vestingStatus} size="sm" />
                          )}
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {showUnvested
                            ? formatEquityPercentage(item.percentVested)
                            : formatEquityPercentage(vestedEquityPercent)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {showUnvested ? "vested" : "of vested pie"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {!showUnvested && projectedData.filter(d => d.vestedSlices === 0).length > 0 && (
                <p className="text-center text-sm text-gray-400 pt-2">
                  {projectedData.filter(d => d.vestedSlices === 0).length} contributor(s) with no vested equity hidden
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
