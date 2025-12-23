/**
 * PDFChartContainer Component
 * Renders a hidden PieChart for PDF export capture
 */

"use client";

import React, { forwardRef } from "react";
import { PieChart, CHART_COLORS } from "@/components/charts/PieChart";
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
 * The chart is rendered off-screen but still in the DOM so html2canvas can capture it.
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
          <PieChart
            data={dataWithColors}
            height={height}
            outerRadius={Math.min(width, height) / 3}
            // Disable legend - it uses Tailwind classes with oklch colors
            // that html2canvas can't parse. The PDF has its own summary table.
            showLegend={false}
            showTooltip={false}
          />
        </div>
      </div>
    );
  }
);

export default PDFChartContainer;
