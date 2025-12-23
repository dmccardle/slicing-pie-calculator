/**
 * usePDFExport Hook
 * Encapsulates PDF generation logic with progress tracking
 */

"use client";

import { useState, useCallback, useRef } from "react";
import type { PDFExportOptions, PDFReportData } from "@/types";
import type { Company, Contributor, Contribution } from "@/types/slicingPie";
import { formatPDFReportData, type ValuationConfig } from "@/utils/pdfDataFormatter";
import { exportEnhancedPDF } from "@/utils/exporters";
import { renderChartToImage, waitForChartReady } from "@/utils/pdfChartRenderer";

/**
 * Export status states
 */
export type PDFExportStatus = "idle" | "preparing" | "rendering" | "complete" | "error";

/**
 * Return type for usePDFExport hook
 */
export interface UsePDFExportReturn {
  /** Current export status */
  status: PDFExportStatus;

  /** Error message if status is 'error' */
  error: string | null;

  /** Progress percentage (0-100) */
  progress: number;

  /** Trigger PDF export with given options */
  exportPDF: (options: PDFExportOptions) => Promise<void>;

  /** Cancel ongoing export */
  cancel: () => void;

  /** Reference to attach to chart container for capture */
  chartRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for managing PDF export with progress tracking
 *
 * @param company - Company information
 * @param contributors - List of contributors
 * @param contributions - List of contributions
 * @param valuationConfig - Optional valuation configuration
 * @returns Export controls and status
 */
export function usePDFExport(
  company: Company,
  contributors: Contributor[],
  contributions: Contribution[],
  valuationConfig: ValuationConfig | null
): UsePDFExportReturn {
  const [status, setStatus] = useState<PDFExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const cancelledRef = useRef(false);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setStatus("idle");
    setProgress(0);
  }, []);

  const exportPDF = useCallback(
    async (options: PDFExportOptions) => {
      // Reset state
      cancelledRef.current = false;
      setError(null);
      setProgress(0);

      try {
        // Check for empty data
        const activeContributions = contributions.filter((c) => !c.deletedAt);
        if (activeContributions.length === 0) {
          setError("No contributions to export. Add some contributions first.");
          setStatus("error");
          return;
        }

        // Stage 1: Preparing (0-20%)
        setStatus("preparing");
        setProgress(10);

        if (cancelledRef.current) return;

        // Format report data
        const reportData: PDFReportData = formatPDFReportData(
          company,
          contributors,
          contributions,
          valuationConfig,
          options
        );

        setProgress(20);

        if (cancelledRef.current) return;

        // Stage 2: Rendering chart (20-50%)
        setStatus("rendering");
        let chartImage: string | undefined;

        if (chartRef.current) {
          try {
            // Wait for chart to be ready
            await waitForChartReady(chartRef.current, 2000);
            setProgress(30);

            if (cancelledRef.current) return;

            // Render chart to image (500x350 - pie with labels on all sides)
            chartImage = await renderChartToImage(chartRef.current, {
              width: 500,
              height: 350,
              scale: 2,
            });
            setProgress(50);
          } catch (chartError) {
            // Log chart rendering error but continue without chart
            console.error("Chart rendering failed:", chartError);
            // Don't set error state - PDF can still be generated without chart
            setProgress(50);
          }
        } else {
          console.warn("No chart ref available for PDF export");
          setProgress(50);
        }

        if (cancelledRef.current) return;

        // Stage 3: Building tables (50-80%)
        setProgress(60);

        if (cancelledRef.current) return;

        // Generate filename
        const dateStr = new Date().toISOString().split("T")[0];
        const sanitizedCompanyName = company.name
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        const filename = `${sanitizedCompanyName}-equity-report-${dateStr}`;

        setProgress(80);

        if (cancelledRef.current) return;

        // Stage 4: Finalizing (80-100%)
        await exportEnhancedPDF({
          data: reportData,
          chartImage,
          options,
          filename,
        });

        setProgress(100);
        setStatus("complete");

        // Reset to idle after a short delay
        setTimeout(() => {
          if (!cancelledRef.current) {
            setStatus("idle");
            setProgress(0);
          }
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to export PDF: ${errorMessage}`);
        setStatus("error");
      }
    },
    [company, contributors, contributions, valuationConfig]
  );

  return {
    status,
    error,
    progress,
    exportPDF,
    cancel,
    chartRef,
  };
}
