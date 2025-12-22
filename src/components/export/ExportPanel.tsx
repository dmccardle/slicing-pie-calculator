"use client";

import React from "react";
import { Button } from "@/components/ui";
import { useExport, type UseExportReturn } from "@/hooks/useExport";
import type { ExcelSheet, PDFTableData } from "@/utils/exporters";

interface ExportPanelProps {
  /** Data to export as JSON */
  jsonData?: unknown;
  /** Filename for JSON export (without extension) */
  jsonFilename?: string;
  /** Sheets for Excel export */
  excelSheets?: ExcelSheet[];
  /** Filename for Excel export (without extension) */
  excelFilename?: string;
  /** Title for PDF export */
  pdfTitle?: string;
  /** Tables for PDF export */
  pdfTables?: PDFTableData[];
  /** Filename for PDF export (without extension) */
  pdfFilename?: string;
  /** Callback when JSON is imported */
  onImport?: (data: unknown) => void;
  /** Custom export hook instance (useful for external control) */
  exportHook?: UseExportReturn;
  /** Additional CSS classes */
  className?: string;
}

export function ExportPanel({
  jsonData,
  jsonFilename = "export",
  excelSheets,
  excelFilename = "export",
  pdfTitle = "Export Report",
  pdfTables,
  pdfFilename = "export",
  onImport,
  exportHook,
  className = "",
}: ExportPanelProps) {
  const internalExport = useExport();
  const { status, error, exportJSON, importJSON, exportExcel, exportPDF } =
    exportHook || internalExport;

  const handleExportJSON = () => {
    if (jsonData) {
      exportJSON(jsonData, jsonFilename);
    }
  };

  const handleImportJSON = async () => {
    try {
      const data = await importJSON();
      onImport?.(data);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleExportExcel = () => {
    if (excelSheets && excelSheets.length > 0) {
      exportExcel(excelSheets, excelFilename);
    }
  };

  const handleExportPDF = () => {
    if (pdfTables && pdfTables.length > 0) {
      exportPDF(pdfTitle, pdfTables, pdfFilename);
    }
  };

  const isExporting = status === "exporting";

  return (
    <div className={`space-y-4 ${className}`}>
      {status === "success" && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Export successful!
        </div>
      )}
      {status === "error" && error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {jsonData !== undefined && (
          <Button
            variant="secondary"
            onClick={handleExportJSON}
            disabled={isExporting}
            isLoading={isExporting}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export JSON
          </Button>
        )}

        {onImport && (
          <Button
            variant="secondary"
            onClick={handleImportJSON}
            disabled={isExporting}
            isLoading={isExporting}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import JSON
          </Button>
        )}

        {excelSheets && excelSheets.length > 0 && (
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={isExporting}
            isLoading={isExporting}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </Button>
        )}

        {pdfTables && pdfTables.length > 0 && (
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            disabled={isExporting}
            isLoading={isExporting}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Export PDF
          </Button>
        )}
      </div>
    </div>
  );
}

export default ExportPanel;
