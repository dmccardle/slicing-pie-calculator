"use client";

import React from "react";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  barColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 300,
  barColor = "#2563eb",
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  className = "",
}: BarChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
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
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}
          <Bar
            dataKey="value"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
