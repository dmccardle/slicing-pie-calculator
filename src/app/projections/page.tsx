"use client";

import { useState, useMemo } from "react";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projections</h1>
        <p className="mt-1 text-sm text-gray-600">
          View future equity distribution based on vesting schedules
        </p>
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Projection Date</h2>
        </CardHeader>
        <CardBody>
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-xs text-gray-500">Total Vested</p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {formatSlices(summary.totalVestedSlices)}
            </p>
            <p className="text-xs text-gray-400">slices</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs text-gray-500">Total Unvested</p>
            <p className="mt-1 text-xl font-bold text-amber-600">
              {formatSlices(summary.totalUnvestedSlices)}
            </p>
            <p className="text-xs text-gray-400">slices</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs text-gray-500">Overall Vested</p>
            <p className="mt-1 text-xl font-bold text-blue-600">
              {formatEquityPercentage(summary.overallPercentVested)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-xs text-gray-500">Status</p>
            <div className="mt-1 flex justify-center gap-1 flex-wrap">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                {summary.contributorsPreCliff} pre-cliff
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {summary.contributorsVesting} vesting
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {summary.contributorsFullyVested} vested
              </span>
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

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Projected Equity Distribution
          </h2>
        </CardHeader>
        <CardBody>
          {projectedData.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No contributors with equity. Add contributors and contributions to see projections.
            </p>
          ) : (
            <ProjectionChart data={projectedData} showUnvested={true} />
          )}
        </CardBody>
      </Card>

      {/* Contributor Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Contributor Vesting Status
          </h2>
        </CardHeader>
        <CardBody>
          {projectedData.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No contributors to display.</p>
          ) : (
            <div className="space-y-4">
              {projectedData.map((item) => {
                const contributor = contributors.find((c) => c.id === item.contributorId);
                const vestingStatus = contributor
                  ? calculateVestingStatus(contributor, item.totalSlices, selectedDate)
                  : null;

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
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            VESTING_STATE_COLORS[item.vestingState]
                          }`}
                        >
                          {VESTING_STATE_LABELS[item.vestingState]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatSlices(item.vestedSlices)} vested / {formatSlices(item.totalSlices)} total
                      </p>
                    </div>
                    <div className="w-full md:w-48">
                      {vestingStatus && (
                        <VestingProgress vestingStatus={vestingStatus} size="sm" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatEquityPercentage(item.percentVested)}
                      </p>
                      <p className="text-xs text-gray-500">vested</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
