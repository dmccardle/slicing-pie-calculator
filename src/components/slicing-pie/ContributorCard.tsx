"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ContributorWithEquity } from "@/types/slicingPie";
import { formatSlices, formatEquityPercentage, formatCurrency } from "@/utils/slicingPie";

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
      </CardBody>
    </Card>
  );
}

export default ContributorCard;
