"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { useValuation } from "@/hooks/useValuation";
import { Table, Card, CardBody, Button } from "@/components/ui";
import { ValuationDisclaimer } from "@/components/valuation";
import {
  formatCompactNumber,
  formatCurrency,
  calculateEquityValue,
} from "@/utils/valuation";
import { formatSlices, formatEquityPercentage } from "@/utils/slicingPie";
import type { TableColumn } from "@/types";

/**
 * Row data for the equity values table
 */
interface EquityValueRow {
  id: string;
  name: string;
  slices: number;
  percentage: number;
  totalValue: number;
  vestedValue?: number;
  vestedSlices?: number;
}

export default function EquityValuesPage() {
  const { contributorsWithEquity, totalSlices, vestedEquityData, isLoading } =
    useSlicingPieContext();
  const { vestingEnabled } = useFeatureFlagsContext();
  const { currentValuation, isLoading: valuationLoading } = useValuation();

  // Compute equity value rows
  const rows = useMemo((): EquityValueRow[] => {
    if (!currentValuation || currentValuation <= 0) return [];

    return contributorsWithEquity.map((contributor) => {
      const totalValue = calculateEquityValue(
        contributor.totalSlices,
        totalSlices,
        currentValuation
      );

      // Find vested data for this contributor
      const vestedData = vestedEquityData.find(
        (v) => v.contributorId === contributor.id
      );

      let vestedValue: number | undefined;
      let vestedSlices: number | undefined;

      if (vestingEnabled && vestedData) {
        vestedSlices = vestedData.vestedSlices;
        vestedValue = calculateEquityValue(
          vestedData.vestedSlices,
          totalSlices,
          currentValuation
        );
      }

      return {
        id: contributor.id,
        name: contributor.name,
        slices: contributor.totalSlices,
        percentage: contributor.equityPercentage,
        totalValue,
        vestedValue,
        vestedSlices,
      };
    });
  }, [
    contributorsWithEquity,
    totalSlices,
    currentValuation,
    vestingEnabled,
    vestedEquityData,
  ]);

  // Table columns
  const columns = useMemo((): TableColumn<EquityValueRow>[] => {
    const baseColumns: TableColumn<EquityValueRow>[] = [
      {
        key: "name",
        label: "Contributor",
        sortable: true,
      },
      {
        key: "slices",
        label: "Slices",
        sortable: true,
        render: (value) => formatSlices(value as number),
      },
      {
        key: "percentage",
        label: "Equity %",
        sortable: true,
        render: (value) => formatEquityPercentage(value as number),
      },
      {
        key: "totalValue",
        label: "Total Value",
        sortable: true,
        render: (value) => (
          <span className="font-medium text-green-700">
            {formatCompactNumber(value as number)}
          </span>
        ),
      },
    ];

    // Add vested value column when vesting is enabled
    if (vestingEnabled) {
      baseColumns.push({
        key: "vestedValue" as keyof EquityValueRow,
        label: "Vested Value",
        sortable: true,
        render: (value, row) => {
          if (value === undefined) {
            return <span className="text-gray-400">-</span>;
          }
          return (
            <div>
              <span className="font-medium text-blue-700">
                {formatCompactNumber(value as number)}
              </span>
              {row.vestedSlices !== undefined && (
                <div className="text-xs text-gray-500">
                  {formatSlices(row.vestedSlices)} slices
                </div>
              )}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [vestingEnabled]);

  // Loading state
  if (isLoading || valuationLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // No valuation configured
  if (!currentValuation || currentValuation <= 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equity Values</h1>
          <p className="mt-1 text-sm text-gray-600">
            View contributor equity in dollar terms
          </p>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No Valuation Configured
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Configure a company valuation to see equity values in dollar terms.
            </p>
            <div className="mt-6">
              <Link href="/settings">
                <Button>Go to Settings</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // No contributors
  if (contributorsWithEquity.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equity Values</h1>
          <p className="mt-1 text-sm text-gray-600">
            View contributor equity in dollar terms
          </p>
        </div>

        <Card>
          <CardBody className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No Contributors
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add contributors to see their equity values.
            </p>
            <div className="mt-6">
              <Link href="/contributors">
                <Button>Add Contributors</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totalEquityValue = rows.reduce((sum, row) => sum + row.totalValue, 0);
  const totalVestedValue = vestingEnabled
    ? rows.reduce((sum, row) => sum + (row.vestedValue || 0), 0)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equity Values</h1>
        <p className="mt-1 text-sm text-gray-600">
          View contributor equity in dollar terms based on company valuation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Company Valuation</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {formatCompactNumber(currentValuation)}
            </div>
            <div className="text-xs text-gray-400">
              {formatCurrency(currentValuation)}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm text-gray-500">Total Allocated</div>
            <div className="mt-1 text-2xl font-bold text-green-700">
              {formatCompactNumber(totalEquityValue)}
            </div>
            <div className="text-xs text-gray-400">
              {formatSlices(totalSlices)} slices
            </div>
          </CardBody>
        </Card>

        {vestingEnabled && totalVestedValue !== undefined && (
          <Card>
            <CardBody>
              <div className="text-sm text-gray-500">Total Vested</div>
              <div className="mt-1 text-2xl font-bold text-blue-700">
                {formatCompactNumber(totalVestedValue)}
              </div>
              <div className="text-xs text-gray-400">
                {formatEquityPercentage(
                  totalSlices > 0
                    ? (totalVestedValue / currentValuation) * 100
                    : 0
                )} of company
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Disclaimer */}
      <ValuationDisclaimer />

      {/* Equity Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <Table
            data={rows}
            columns={columns}
            emptyMessage="No contributors found"
          />
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-400">
        Values are calculated based on the configured company valuation.
        Click column headers to sort.
      </p>
    </div>
  );
}
