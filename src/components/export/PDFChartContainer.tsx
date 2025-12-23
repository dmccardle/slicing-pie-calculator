/**
 * PDFChartContainer Component
 * Renders a hidden PieChart for PDF export capture with labels on all slices.
 * Implements label collision avoidance to ensure all labels are readable.
 */

"use client";

import React, { forwardRef, useMemo } from "react";
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

  /** Width of the chart in pixels (default: 550) */
  width?: number;

  /** Height of the chart in pixels (default: 400) */
  height?: number;

  /** Whether the container is visible (for debugging) */
  visible?: boolean;
}

interface DataWithColors extends ChartDataPoint {
  color: string;
  percent: number;
}

interface LabelPosition {
  name: string;
  percent: number;
  // Original position (on pie edge)
  originX: number;
  originY: number;
  // Label position (possibly adjusted for collision)
  labelX: number;
  labelY: number;
  // Which side of the pie
  isRightSide: boolean;
}

const RADIAN = Math.PI / 180;
const MIN_LABEL_SPACING = 18; // Minimum pixels between label centers

/**
 * Calculate initial label positions based on slice angles
 */
function calculateLabelPositions(
  data: DataWithColors[],
  cx: number,
  cy: number,
  outerRadius: number
): LabelPosition[] {
  let currentAngle = 90; // Recharts starts at 90 degrees (top)

  return data.map((item) => {
    const sliceAngle = item.percent * 360;
    const midAngle = currentAngle - sliceAngle / 2;
    currentAngle -= sliceAngle;

    // Point on pie edge
    const originX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const originY = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    // Initial label position (further out)
    const labelRadius = outerRadius + 35;
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return {
      name: item.name,
      percent: item.percent,
      originX,
      originY,
      labelX,
      labelY,
      isRightSide: labelX > cx,
    };
  });
}

/**
 * Resolve label collisions by spreading overlapping labels vertically
 */
function resolveCollisions(labels: LabelPosition[]): LabelPosition[] {
  // Split into left and right sides
  const rightLabels = labels.filter(l => l.isRightSide).sort((a, b) => a.labelY - b.labelY);
  const leftLabels = labels.filter(l => !l.isRightSide).sort((a, b) => a.labelY - b.labelY);

  // Spread labels on each side
  const spreadLabels = (sideLabels: LabelPosition[]): LabelPosition[] => {
    if (sideLabels.length <= 1) return sideLabels;

    const result = [...sideLabels];

    // Multiple passes to resolve all collisions
    for (let pass = 0; pass < 5; pass++) {
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        const gap = curr.labelY - prev.labelY;

        if (gap < MIN_LABEL_SPACING) {
          // Push current label down
          const adjustment = (MIN_LABEL_SPACING - gap) / 2;
          result[i - 1] = { ...prev, labelY: prev.labelY - adjustment };
          result[i] = { ...curr, labelY: curr.labelY + adjustment };
        }
      }
    }

    return result;
  };

  return [...spreadLabels(leftLabels), ...spreadLabels(rightLabels)];
}

/**
 * Custom SVG labels with collision avoidance
 */
function CustomLabels({
  labels,
}: {
  labels: LabelPosition[];
}) {
  return (
    <g>
      {labels.map((label, index) => {
        const percentText = `${(label.percent * 100).toFixed(1)}%`;
        const maxLen = 14;
        const displayName = label.name.length > maxLen
          ? `${label.name.substring(0, maxLen - 2)}..`
          : label.name;

        // Connector line: from pie edge to label
        // Use a bent line for better readability
        const elbowX = label.isRightSide
          ? Math.max(label.originX + 10, label.labelX - 30)
          : Math.min(label.originX - 10, label.labelX + 30);

        return (
          <g key={`label-${index}`}>
            {/* Connector line */}
            <polyline
              points={`${label.originX},${label.originY} ${elbowX},${label.labelY} ${label.labelX},${label.labelY}`}
              fill="none"
              stroke="#9ca3af"
              strokeWidth={1}
            />
            {/* Label text */}
            <text
              x={label.labelX + (label.isRightSide ? 5 : -5)}
              y={label.labelY}
              fill="#374151"
              textAnchor={label.isRightSide ? "start" : "end"}
              dominantBaseline="central"
              style={{ fontSize: "11px", fontFamily: "Arial, sans-serif" }}
            >
              {`${displayName} ${percentText}`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/**
 * Hidden container that renders a PieChart for PDF export capture.
 * Labels are shown on ALL slices with collision avoidance.
 */
export const PDFChartContainer = forwardRef<HTMLDivElement, PDFChartContainerProps>(
  function PDFChartContainer(
    { data, width = 550, height = 400, visible = false },
    ref
  ) {
    // Calculate total for percentage computation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Ensure data has colors and percentages assigned
    const dataWithColors: DataWithColors[] = useMemo(() =>
      data.map((item, index) => ({
        ...item,
        color: item.color || CHART_COLORS[index % CHART_COLORS.length],
        percent: total > 0 ? item.value / total : 0,
      })),
      [data, total]
    );

    // Pie centered with room for labels on all sides
    const padding = 120; // Space for labels
    const availableSize = Math.min(width - padding * 2, height - padding * 2);
    const outerRadius = availableSize / 2;
    const cx = width / 2;
    const cy = height / 2;

    // Calculate and resolve label positions
    const labelPositions = useMemo(() => {
      if (dataWithColors.length === 0) return [];
      const initial = calculateLabelPositions(dataWithColors, cx, cy, outerRadius);
      return resolveCollisions(initial);
    }, [dataWithColors, cx, cy, outerRadius]);

    if (data.length === 0) {
      return null;
    }

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
              labelLine={false}
              label={false}
            >
              {dataWithColors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            {/* Custom labels with collision avoidance */}
            <CustomLabels labels={labelPositions} />
          </RechartsPie>
        </div>
      </div>
    );
  }
);

export default PDFChartContainer;
