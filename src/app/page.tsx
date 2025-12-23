"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { useSlicingPie } from "@/hooks/useSlicingPie";
import { useValuation } from "@/hooks/useValuation";
import { usePDFExport } from "@/hooks/usePDFExport";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PDFChartContainer, PDFExportOptions } from "@/components/export";
import { EquitySummary, OnboardingModal, LocalStorageBanner } from "@/components/slicing-pie";
import type { Company, Contributor, Contribution } from "@/types/slicingPie";
import type { PDFExportOptions as PDFExportOptionsType, ChartDataPoint } from "@/types";
import { CHART_COLORS } from "@/components/charts/PieChart";
import { formatSlices } from "@/utils/slicingPie";
import { ChartPieIcon, UserPlusIcon, SparklesIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

const ONBOARDING_DISMISSED_KEY = "slicingPie_onboardingDismissed";

// Color palette for contributors
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
];

// Lighter versions for unvested portions
const LIGHT_COLORS = [
  "#93C5FD", // light blue
  "#6EE7B7", // light green
  "#FCD34D", // light amber
  "#FCA5A5", // light red
  "#C4B5FD", // light purple
  "#F9A8D4", // light pink
  "#5EEAD4", // light teal
  "#FDBA74", // light orange
];

interface PieChartDataItem {
  name: string;
  value: number;
  slices: number;
  color: string;
}

interface VestingPieChartDataItem {
  name: string;
  value: number;
  slices: number;
  color: string;
  isVested: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieChartDataItem | VestingPieChartDataItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Slices: {data.slices.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Equity: {data.value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

function EmptyState() {
  return (
    <Card>
      <CardBody className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No Contributors Yet
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Start tracking equity by adding your first contributor and logging
          their contributions.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/contributors">
            <Button variant="primary">
              <UserPlusIcon className="h-5 w-5" />
              Add Contributors
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              // Will be handled by OnboardingModal in Phase 8
              window.dispatchEvent(new CustomEvent("loadSampleData"));
            }}
          >
            <SparklesIcon className="h-5 w-5" />
            Load Sample Data
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

interface SlicingPieExportData {
  version: string;
  exportedAt: string;
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
}

export default function Dashboard() {
  const {
    company,
    contributors,
    contributions,
    isLoading,
    hasData,
    loadSampleData,
    vestedEquityData,
    vestingSummary,
    importData,
  } = useSlicingPieContext();

  const { vestingEnabled } = useFeatureFlagsContext();
  const { pieChartData, summary } = useSlicingPie(contributors, contributions);
  const { config: valuationConfig } = useValuation();

  // PDF Export state and hook
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptionsType>({
    includeContributionsBreakdown: true,
    includeValuation: false,
    includeVesting: false,
  });

  const {
    status: pdfStatus,
    error: pdfError,
    progress: pdfProgress,
    exportPDF,
    chartRef,
  } = usePDFExport(
    company,
    contributors,
    contributions,
    valuationConfig ? { mode: valuationConfig.mode, manualValue: valuationConfig.manualValue } : null
  );

  // Calculate chart data for PDF export
  const pdfChartData: ChartDataPoint[] = useMemo(() => {
    const activeContributions = contributions.filter((c) => !c.deletedAt);
    const contributorSlices = new Map<string, number>();

    activeContributions.forEach((c) => {
      const current = contributorSlices.get(c.contributorId) || 0;
      contributorSlices.set(c.contributorId, current + c.slices);
    });

    return contributors
      .filter((c) => !c.deletedAt && (contributorSlices.get(c.id) || 0) > 0)
      .map((contributor, index) => ({
        name: contributor.name,
        value: contributorSlices.get(contributor.id) || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [contributors, contributions]);

  const hasValuation = valuationConfig?.manualValue != null && valuationConfig.manualValue > 0;
  const isPDFExporting = pdfStatus === "preparing" || pdfStatus === "rendering";

  const handlePDFExport = () => {
    exportPDF(pdfOptions);
    setShowPDFOptions(false);
  };

  // Build vesting-aware pie chart data when vesting is enabled
  const vestingPieChartData = useMemo(() => {
    if (!vestingEnabled || vestedEquityData.length === 0) {
      return [];
    }

    const totalSlices = vestedEquityData.reduce((sum, d) => sum + d.totalSlices, 0);
    if (totalSlices === 0) return [];

    const result: VestingPieChartDataItem[] = [];
    vestedEquityData.forEach((item, index) => {
      // Add vested portion
      if (item.vestedSlices > 0) {
        result.push({
          name: `${item.contributorName} (Vested)`,
          value: (item.vestedSlices / totalSlices) * 100,
          slices: item.vestedSlices,
          color: COLORS[index % COLORS.length],
          isVested: true,
        });
      }
      // Add unvested portion
      if (item.unvestedSlices > 0) {
        result.push({
          name: `${item.contributorName} (Unvested)`,
          value: (item.unvestedSlices / totalSlices) * 100,
          slices: item.unvestedSlices,
          color: LIGHT_COLORS[index % LIGHT_COLORS.length],
          isVested: false,
        });
      }
    });
    return result;
  }, [vestingEnabled, vestedEquityData]);

  // First-time detection for onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding has been dismissed and there's no data
    if (!isLoading && !hasData) {
      const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [isLoading, hasData]);

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
    setShowOnboarding(false);
  };

  const handleLoadSampleData = () => {
    loadSampleData();
    handleDismissOnboarding();
  };

  const handleImport = (data: SlicingPieExportData) => {
    // Use bulk import to avoid race condition with debounced localStorage writes
    importData({
      company: data.company,
      contributors: data.contributors,
      contributions: data.contributions,
    });
  };

  // Handler for onboarding import - reuse the main import handler
  const handleOnboardingImport = (data: { company: { name: string }; contributors: unknown[]; contributions: unknown[] }) => {
    importData({
      company: data.company as Company,
      contributors: data.contributors as Contributor[],
      contributions: data.contributions as Contribution[],
    });
    // Close onboarding modal and mark as dismissed
    handleDismissOnboarding();
  };

  // Listen for loadSampleData event from EmptyState
  useEffect(() => {
    const handleLoadSampleDataEvent = () => {
      loadSampleData();
    };
    window.addEventListener("loadSampleData", handleLoadSampleDataEvent);
    return () => {
      window.removeEventListener("loadSampleData", handleLoadSampleDataEvent);
    };
  }, [loadSampleData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleDismissOnboarding}
        onLoadSampleData={handleLoadSampleData}
        onStartEmpty={handleDismissOnboarding}
        onImportData={handleOnboardingImport}
      />

      {/* Local Storage Warning Banner */}
      <LocalStorageBanner
        company={company}
        contributors={contributors}
        contributions={contributions}
        onImport={handleImport}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ChartPieIcon className="h-7 w-7 text-blue-600" />
            Equity Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and visualize equity distribution using the Slicing Pie model
          </p>
        </div>

        {/* PDF Export Button */}
        {hasData && (
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowPDFOptions(!showPDFOptions)}
              disabled={isPDFExporting || pdfChartData.length === 0}
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {isPDFExporting
                ? `Exporting... ${pdfProgress}%`
                : "Export PDF"}
            </Button>

            {/* PDF Options Dropdown */}
            {showPDFOptions && !isPDFExporting && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                <PDFExportOptions
                  options={pdfOptions}
                  onChange={setPdfOptions}
                  valuationAvailable={hasValuation}
                  vestingEnabled={vestingEnabled}
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePDFExport}
                  >
                    Generate PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPDFOptions(false)}
                  >
                    Cancel
                  </Button>
                </div>
                {pdfError && (
                  <p className="mt-2 text-sm text-red-600">{pdfError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary Cards */}
          <EquitySummary
            totalSlices={summary.totalSlices}
            contributorCount={summary.totalContributors}
            activeContributors={summary.activeContributors}
            contributionsThisMonth={summary.contributionsThisMonth}
            recentActivityDate={
              contributions.length > 0
                ? [...contributions].sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0]?.date
                : undefined
            }
          />

          {/* Vesting Summary - Only when vesting is enabled */}
          {vestingEnabled && vestingSummary.totalSlices > 0 && (
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-600">
                        Vested: {formatSlices(vestingSummary.totalVestedSlices)} slices
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-200 border border-dashed border-gray-400" />
                      <span className="text-sm text-gray-600">
                        Unvested: {formatSlices(vestingSummary.totalUnvestedSlices)} slices
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {vestingSummary.contributorsPreCliff} pre-cliff
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {vestingSummary.contributorsVesting} vesting
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      {vestingSummary.contributorsFullyVested} vested
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Equity Pie Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Equity Distribution
                {vestingEnabled && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (with vesting status)
                  </span>
                )}
              </h2>
            </CardHeader>
            <CardBody>
              {(vestingEnabled ? vestingPieChartData.length > 0 : pieChartData.length > 0) ? (
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={vestingEnabled ? vestingPieChartData : pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => {
                          // For vesting mode, show shortened name
                          const displayName = vestingEnabled
                            ? name.split(" ")[0]
                            : name;
                          return value > 5 ? `${displayName}: ${value.toFixed(0)}%` : "";
                        }}
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(vestingEnabled ? vestingPieChartData : pieChartData).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            strokeWidth={(entry as VestingPieChartDataItem).isVested === false ? 1 : 2}
                            stroke={(entry as VestingPieChartDataItem).isVested === false ? "#ddd" : entry.color}
                            strokeDasharray={(entry as VestingPieChartDataItem).isVested === false ? "4 2" : "0"}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <p>No contributions recorded yet.</p>
                  <Link
                    href="/contributions"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    Log your first contribution
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Contributor Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Contributor Breakdown
                </h2>
                <Link href="/contributors">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total Slices
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pieChartData.map((contributor) => (
                    <tr key={contributor.name} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: contributor.color }}
                          />
                          {contributor.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                        {contributor.slices.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {contributor.value.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Hidden chart container for PDF export */}
      <PDFChartContainer ref={chartRef} data={pdfChartData} />
    </div>
  );
}
