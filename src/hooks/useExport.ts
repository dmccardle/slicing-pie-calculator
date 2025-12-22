"use client";

import { useCallback, useState } from "react";
import {
  exportToJSON,
  importFromJSON,
  exportToExcel,
  exportToPDF,
  type ExcelSheet,
  type PDFTableData,
} from "@/utils/exporters";

/**
 * Export status
 */
export type ExportStatus = "idle" | "exporting" | "success" | "error";

/**
 * Return type for useExport hook
 */
export interface UseExportReturn {
  status: ExportStatus;
  error: string | null;
  exportJSON: <T>(data: T, filename?: string) => void;
  importJSON: <T>() => Promise<T>;
  exportExcel: (sheets: ExcelSheet[], filename?: string) => void;
  exportPDF: (title: string, tables: PDFTableData[], filename?: string) => void;
  reset: () => void;
}

/**
 * Hook for export/import operations with status tracking
 */
export function useExport(): UseExportReturn {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(
    async (exportFn: () => void | Promise<void>) => {
      setStatus("exporting");
      setError(null);

      try {
        await exportFn();
        setStatus("success");
        // Reset to idle after 2 seconds
        setTimeout(() => setStatus("idle"), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Export failed");
        setStatus("error");
      }
    },
    []
  );

  const exportJSON = useCallback(
    <T,>(data: T, filename?: string) => {
      handleExport(() => exportToJSON(data, filename));
    },
    [handleExport]
  );

  const importJSON = useCallback(async <T,>(): Promise<T> => {
    setStatus("exporting");
    setError(null);

    try {
      const data = await importFromJSON<T>();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
      return data;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Import failed";
      setError(errorMsg);
      setStatus("error");
      throw e;
    }
  }, []);

  const exportExcel = useCallback(
    (sheets: ExcelSheet[], filename?: string) => {
      handleExport(() => exportToExcel(sheets, filename));
    },
    [handleExport]
  );

  const exportPDF = useCallback(
    (title: string, tables: PDFTableData[], filename?: string) => {
      handleExport(() => exportToPDF(title, tables, filename));
    },
    [handleExport]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    exportJSON,
    importJSON,
    exportExcel,
    exportPDF,
    reset,
  };
}

export default useExport;
