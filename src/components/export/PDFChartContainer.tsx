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
} from "recharts";
import { CHART_COLORS } from "@/components/charts/PieChart";
import type { ChartDataPoint } from "@/types";

interface PDFChartContainerProps {
  /** Chart data to render */
  data: ChartDataPoint[];

  /** Width of the chart in pixels (default: 400) */
  width?: number;

  /** Height of the chart in pixels (default: 300) */
  height?: number;

  /** Whether the container is visible (for debugging) */
  visible?: boolean;
}

/**
 * Hidden container that renders a PieChart for PDF export capture.
 *
 * IMPORTANT: This component renders Recharts directly WITHOUT ResponsiveContainer
 * because ResponsiveContainer doesn't work with off-screen elements.
 * html2canvas requires elements to be in the DOM but they can be positioned off-screen.
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
    { data, width = 400, height = 300, visible = false },
    ref
  ) {
    // Ensure data has colors assigned for consistency
    const dataWithColors = data.map((item, index) => ({
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
    }));

    // If no data, don't render anything
    if (data.length === 0) {
      return null;
    }

    // Calculate chart dimensions
    const outerRadius = Math.min(width, height) / 3;
    const cx = width / 2;
    const cy = height / 2;

    // Position off-screen but still in the document flow for proper rendering
    // html2canvas requires the element to be rendered (not display:none or visibility:hidden)
    // IMPORTANT: Use inline styles with hex colors only - html2canvas doesn't support oklch
    const containerStyle: React.CSSProperties = visible
      ? {
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#ffffff",
        }
      : {
          position: "absolute",
          // Position just outside viewport - still renders but not visible
          left: "-1000px",
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
        // Force standard colors for html2canvas compatibility
        data-html2canvas-ignore-colors="false"
      >
        {/* Wrapper to isolate from Tailwind's oklch colors */}
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
              labelLine={false}
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
          </RechartsPie>
        </div>
      </div>
    );
  }
);

export default PDFChartContainer;
