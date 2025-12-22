"use client";

import React from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface PieChartProps {
  data: ChartDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// Default color palette
const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#c026d3", // fuchsia-600
  "#ea580c", // orange-600
];

export function PieChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  className = "",
}: PieChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [value.toLocaleString(), "Value"]}
            />
          )}
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChart;
