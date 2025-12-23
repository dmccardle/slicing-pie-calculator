"use client";

import React from "react";
import type { VestingStatus } from "@/types/slicingPie";

interface VestingProgressProps {
  vestingStatus: VestingStatus;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export function VestingProgress({
  vestingStatus,
  showLabels = true,
  size = "md",
}: VestingProgressProps) {
  const { percentVested, state } = vestingStatus;

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  // Color based on vesting state
  const vestedColor =
    state === "preCliff"
      ? "bg-amber-500"
      : state === "vesting"
      ? "bg-blue-500"
      : "bg-green-500";

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Vested</span>
          <span>{Math.round(percentVested)}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full bg-gray-200 overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentVested}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(percentVested)}% vested`}
      >
        <div
          className={`${sizeClasses[size]} ${vestedColor} rounded-full transition-all duration-300`}
          style={{ width: `${percentVested}%` }}
        />
      </div>
    </div>
  );
}

export default VestingProgress;
