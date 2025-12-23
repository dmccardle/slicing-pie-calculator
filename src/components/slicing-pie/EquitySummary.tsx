"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { formatSlices } from "@/utils/slicingPie";
import {
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface SummaryItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}

interface EquitySummaryProps {
  totalSlices: number;
  contributorCount: number;
  activeContributors: number;
  contributionsThisMonth: number;
  recentActivityDate?: string;
  className?: string;
}

function SummaryCard({ label, value, subtext, icon }: SummaryItem) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <CardBody className="text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mb-1">
          {icon}
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </CardBody>
    </Card>
  );
}

export function EquitySummary({
  totalSlices,
  contributorCount,
  activeContributors,
  contributionsThisMonth,
  recentActivityDate,
  className = "",
}: EquitySummaryProps) {
  const formattedDate = recentActivityDate
    ? new Date(recentActivityDate).toLocaleDateString()
    : "No activity yet";

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <SummaryCard
        label="Total Slices"
        value={formatSlices(totalSlices)}
        subtext="Across all contributors"
        icon={<span aria-hidden="true">🍕</span>}
      />
      <SummaryCard
        label="Contributors"
        value={contributorCount}
        subtext={`${activeContributors} active`}
        icon={<UsersIcon className="h-4 w-4" />}
      />
      <SummaryCard
        label="This Month"
        value={contributionsThisMonth}
        subtext="New contributions"
        icon={<CalendarDaysIcon className="h-4 w-4" />}
      />
      <SummaryCard
        label="Recent Activity"
        value={formattedDate}
        subtext={recentActivityDate ? "Last contribution" : undefined}
        icon={<ClockIcon className="h-4 w-4" />}
      />
    </div>
  );
}

export default EquitySummary;
