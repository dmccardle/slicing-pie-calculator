"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { VestedEquityDataItem } from "@/utils/vesting";
import { formatSlices } from "@/utils/slicingPie";

interface ProjectionChartProps {
  data: VestedEquityDataItem[];
  showUnvested?: boolean;
}

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

// Lighter versions for unvested
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

export function ProjectionChart({ data, showUnvested = true }: ProjectionChartProps) {
  // Transform data for pie chart
  // If showUnvested, we show both vested and unvested segments
  // Otherwise, just show total slices
  const chartData = showUnvested
    ? data.flatMap((item, index) => {
        const result = [];
        if (item.vestedSlices > 0) {
          result.push({
            name: `${item.contributorName} (Vested)`,
            value: item.vestedSlices,
            color: COLORS[index % COLORS.length],
            isVested: true,
          });
        }
        if (item.unvestedSlices > 0) {
          result.push({
            name: `${item.contributorName} (Unvested)`,
            value: item.unvestedSlices,
            color: LIGHT_COLORS[index % LIGHT_COLORS.length],
            isVested: false,
          });
        }
        return result;
      })
    : data
        .filter((item) => item.vestedSlices > 0)
        .map((item, index) => ({
          name: item.contributorName,
          value: item.vestedSlices,
          color: COLORS[index % COLORS.length],
          isVested: true,
        }));

  // Filter out zero-value entries
  const filteredData = chartData.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No equity data to display
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={500}
            label={({ name, percent }) =>
              percent > 0.05 ? `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%` : ""
            }
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                strokeWidth={entry.isVested ? 2 : 1}
                stroke={entry.isVested ? entry.color : "#ddd"}
                strokeDasharray={entry.isVested ? "0" : "4 2"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatSlices(value)}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProjectionChart;
