/**
 * PDFChartContainer Component
 * Renders a hidden PieChart for PDF export capture
 */

"use client";

import React, { forwardRef } from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/components/charts/PieChart";
import type { ChartDataPoint } from "@/types";

interface PDFChartContainerProps {
  /** Chart data to render */
  data: ChartDataPoint[];

  /** Width of the chart in pixels (default: 500) */
  width?: number;

  /** Height of the chart in pixels (default: 300) */
  height?: number;

  /** Whether the container is visible (for debugging) */
  visible?: boolean;
}

/**
 * Custom label renderer for pie slices
 * Shows percentage on the slice if it's large enough
 */
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: LabelProps) {
  // Only show label if slice is large enough (> 5%)
  if (percent < 0.05) return null;

  // Position label outside the slice
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Truncate long names
  const displayName = name.length > 12 ? `${name.substring(0, 10)}...` : name;
  const percentText = `${(percent * 100).toFixed(1)}%`;

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "11px", fontFamily: "Arial, sans-serif" }}
    >
      {`${displayName} (${percentText})`}
    </text>
  );
}

/**
 * Custom legend formatter for the pie chart
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLegendText(value: string, entry: any) {
  const percent = entry?.payload?.percent;
  const percentText = percent ? ` (${(percent * 100).toFixed(1)}%)` : "";
  const displayName = value.length > 15 ? `${value.substring(0, 13)}...` : value;
  return (
    <span style={{ color: "#374151", fontSize: "11px" }}>
      {displayName}{percentText}
    </span>
  );
}

/**
 * Hidden container that renders a PieChart for PDF export capture.
 *
 * IMPORTANT: This component renders Recharts directly WITHOUT ResponsiveContainer
 * because ResponsiveContainer doesn't work with off-screen elements.
 * SVG is serialized directly for PDF embedding.
 *
 * Usage:
 * ```tsx
 * const chartRef = useRef<HTMLDivElement>(null);
 *
 * <PDFChartContainer
 *   ref={chartRef}
 *   data={chartData}
 * />
 * ```
 */
export const PDFChartContainer = forwardRef<HTMLDivElement, PDFChartContainerProps>(
  function PDFChartContainer(
    { data, width = 500, height = 300, visible = false },
    ref
  ) {
    // Calculate total for percentage computation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Ensure data has colors and percentages assigned for consistency
    const dataWithColors = data.map((item, index) => ({
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      percent: total > 0 ? item.value / total : 0,
    }));

    // If no data, don't render anything
    if (data.length === 0) {
      return null;
    }

    // Calculate chart dimensions - leave room for legend on the right
    const chartAreaWidth = width * 0.6;
    const outerRadius = Math.min(chartAreaWidth, height) / 3;
    const cx = chartAreaWidth / 2;
    const cy = height / 2;

    // Position off-screen but still in the document flow for proper rendering
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
          {/*
            Render Recharts directly with explicit width/height.
            DO NOT use ResponsiveContainer - it doesn't work with off-screen elements!
          */}
          <RechartsPie width={width} height={height}>
            <Pie
              data={dataWithColors}
              cx={cx}
              cy={cy}
              labelLine={true}
              label={renderCustomLabel}
              innerRadius={0}
              outerRadius={outerRadius}
              dataKey="value"
              nameKey="name"
            >
              {dataWithColors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={renderLegendText}
              wrapperStyle={{
                paddingLeft: "20px",
                fontSize: "11px",
              }}
            />
          </RechartsPie>
        </div>
      </div>
    );
  }
);

export default PDFChartContainer;
