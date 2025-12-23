"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useExport } from "@/hooks/useExport";
import type { Company, Contributor, Contribution } from "@/types/slicingPie";
import {
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const DISMISSED_KEY = "localStorageBannerDismissed";

interface SlicingPieExportData {
  version: string;
  exportedAt: string;
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
}

interface LocalStorageBannerProps {
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
  onImport: (data: SlicingPieExportData) => void;
}

function validateImportData(data: unknown): data is SlicingPieExportData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== "string") return false;
  if (!obj.company || typeof obj.company !== "object") return false;
  if (!Array.isArray(obj.contributors)) return false;
  if (!Array.isArray(obj.contributions)) return false;

  const company = obj.company as Record<string, unknown>;
  if (typeof company.name !== "string") return false;

  for (const c of obj.contributors as Record<string, unknown>[]) {
    if (typeof c.id !== "string") return false;
    if (typeof c.name !== "string") return false;
    if (typeof c.hourlyRate !== "number") return false;
  }

  for (const c of obj.contributions as Record<string, unknown>[]) {
    if (typeof c.id !== "string") return false;
    if (typeof c.contributorId !== "string") return false;
    if (typeof c.type !== "string") return false;
    if (typeof c.value !== "number") return false;
    if (typeof c.slices !== "number") return false;
  }

  return true;
}

export function LocalStorageBanner({
  company,
  contributors,
  contributions,
  onImport,
}: LocalStorageBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<SlicingPieExportData | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { status, exportJSON, importJSON } = useExport();
  const isProcessing = status === "exporting";

  // Check sessionStorage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  const handleExport = () => {
    const exportData: SlicingPieExportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      company,
      contributors,
      contributions,
    };
    exportJSON(exportData, "slicing-pie-backup");
    setFeedback({ type: "success", text: "Data exported successfully!" });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleImportClick = async () => {
    try {
      const data = await importJSON<SlicingPieExportData>();
      if (!validateImportData(data)) {
        setFeedback({
          type: "error",
          text: "Invalid file format. Please select a valid Slicing Pie backup.",
        });
        return;
      }
      setPendingImportData(data);
      setShowImportModal(true);
    } catch {
      // User cancelled file picker - silently handle
    }
  };

  const handleConfirmImport = () => {
    if (pendingImportData) {
      onImport(pendingImportData);
      setShowImportModal(false);
      setPendingImportData(null);
      setFeedback({ type: "success", text: "Data imported successfully!" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setPendingImportData(null);
  };

  if (isDismissed) return null;

  return (
    <>
      <div
        role="alert"
        className="rounded-lg border border-green-200 bg-green-50 p-4"
      >
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon
            className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800">
              Your data is stored locally in this browser
            </p>
            <p className="mt-1 text-sm text-green-700">
              Data is not synced between devices or browsers. Export regularly to back up your equity records.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={isProcessing}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export JSON
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImportClick}
                disabled={isProcessing}
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import JSON
              </Button>
            </div>
            {feedback && (
              <p
                className={`mt-2 text-sm ${
                  feedback.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {feedback.text}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-md border border-green-300 bg-green-100 px-2 py-1 text-sm font-medium text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Dismiss
          </button>
        </div>
      </div>

      <Modal
        isOpen={showImportModal}
        onClose={handleCancelImport}
        title="Confirm Import"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This will replace all your current data with the imported file.
          </p>
          {pendingImportData && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">
                {pendingImportData.company.name || "Unnamed Company"}
              </p>
              <p className="text-gray-600">
                {pendingImportData.contributors.length} contributor(s),{" "}
                {pendingImportData.contributions.length} contribution(s)
              </p>
            </div>
          )}
          <p className="text-sm text-amber-600">
            Your current data will be permanently replaced.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleCancelImport}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmImport}>
              Import
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default LocalStorageBanner;
