/**
 * PDFChartContainer Component
 * Renders a hidden PieChart for PDF export capture with labels on all slices
 */

"use client";

import React, { forwardRef } from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import { CHART_COLORS } from "@/components/charts/PieChart";
import type { ChartDataPoint } from "@/types";

interface PDFChartContainerProps {
  /** Chart data to render */
  data: ChartDataPoint[];

  /** Width of the chart in pixels (default: 500) */
  width?: number;

  /** Height of the chart in pixels (default: 350) */
  height?: number;

  /** Whether the container is visible (for debugging) */
  visible?: boolean;
}

interface DataWithColors extends ChartDataPoint {
  color: string;
  percent: number;
}

const RADIAN = Math.PI / 180;

/**
 * Custom label renderer that shows name and percentage for ALL slices
 * Labels are positioned outside the pie with connecting lines
 */
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
  index: number;
}

function renderLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: LabelProps) {
  // Position label further out for readability
  const labelRadius = outerRadius + 30;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  // Format percentage
  const percentText = `${(percent * 100).toFixed(1)}%`;

  // Truncate long names
  const maxLen = 14;
  const displayName = name.length > maxLen ? `${name.substring(0, maxLen - 2)}..` : name;

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "11px", fontFamily: "Arial, sans-serif" }}
    >
      {`${displayName} ${percentText}`}
    </text>
  );
}

/**
 * Hidden container that renders a PieChart for PDF export capture.
 * Labels are shown on ALL slices with callout lines.
 */
export const PDFChartContainer = forwardRef<HTMLDivElement, PDFChartContainerProps>(
  function PDFChartContainer(
    { data, width = 500, height = 350, visible = false },
    ref
  ) {
    // Calculate total for percentage computation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Ensure data has colors and percentages assigned
    const dataWithColors: DataWithColors[] = data.map((item, index) => ({
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      percent: total > 0 ? item.value / total : 0,
    }));

    if (data.length === 0) {
      return null;
    }

    // Pie centered with room for labels on all sides
    const padding = 100; // Space for labels
    const availableSize = Math.min(width - padding * 2, height - padding * 2);
    const outerRadius = availableSize / 2;
    const cx = width / 2;
    const cy = height / 2;

    const containerStyle: React.CSSProperties = visible
      ? {
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#ffffff",
        }
      : {
          position: "absolute",
          left: "-2000px",
          top: "0px",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#ffffff",
          overflow: "hidden",
        };

    return (
      <div
        ref={ref}
        style={containerStyle}
        aria-hidden={!visible}
      >
        <div style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          width: "100%",
          height: "100%",
        }}>
          <RechartsPie width={width} height={height}>
            <Pie
              data={dataWithColors}
              cx={cx}
              cy={cy}
              innerRadius={0}
              outerRadius={outerRadius}
              dataKey="value"
              nameKey="name"
              label={renderLabel}
              labelLine={{
                stroke: "#9ca3af",
                strokeWidth: 1,
              }}
            >
              {dataWithColors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </RechartsPie>
        </div>
      </div>
    );
  }
);

export default PDFChartContainer;
