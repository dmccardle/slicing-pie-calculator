"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ImportConfirmModal } from "./ImportConfirmModal";
import { useExport } from "@/hooks/useExport";
import { ArrowUpTrayIcon, PlusCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface SlicingPieExportData {
  version: string;
  exportedAt: string;
  company: { name: string };
  contributors: unknown[];
  contributions: unknown[];
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
  return true;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onStartEmpty: () => void;
  onImportData: (data: SlicingPieExportData) => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onLoadSampleData,
  onStartEmpty,
  onImportData,
}: OnboardingModalProps) {
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<SlicingPieExportData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const { importJSON } = useExport();

  const handleImportClick = async () => {
    setImportError(null);
    try {
      const data = await importJSON<SlicingPieExportData>();
      if (!validateImportData(data)) {
        setImportError("Invalid file format. Please select a valid Slicing Pie backup.");
        return;
      }
      setPendingImportData(data);
      setShowImportConfirm(true);
    } catch {
      // User cancelled file picker - silently handle
    }
  };

  const handleConfirmImport = () => {
    if (pendingImportData) {
      onImportData(pendingImportData);
      setShowImportConfirm(false);
      setPendingImportData(null);
      onClose();
    }
  };

  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportData(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to Slicing Pie">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Track Startup Equity Fairly
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Use the Slicing Pie model to calculate fair equity distribution
            based on contributions from each team member.
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900">How it works:</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-600">1.</span>
              Add contributors with their hourly rates
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-600">2.</span>
              Log contributions (time, cash, non-cash, ideas, relationships)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-600">3.</span>
              Watch the equity pie update in real-time
            </li>
          </ul>
        </div>

        {importError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {importError}
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleImportClick}
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Import Data (.json file)
            <span className="ml-2 text-xs opacity-75">
              Restore from a backup
            </span>
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              onStartEmpty();
              onClose();
            }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            Start Empty
            <span className="ml-2 text-xs opacity-75">
              Add your own contributors
            </span>
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              onLoadSampleData();
              onClose();
            }}
          >
            <SparklesIcon className="h-5 w-5" />
            Load Sample Data
            <span className="ml-2 text-xs opacity-75">
              See the platform in action
            </span>
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          All data is stored locally in your browser.
        </p>
      </div>

      {/* Import Confirmation Modal */}
      <ImportConfirmModal
        isOpen={showImportConfirm}
        onClose={handleCancelImport}
        onConfirm={handleConfirmImport}
        importData={pendingImportData}
        hasExistingData={false}
      />
    </Modal>
  );
}

export default OnboardingModal;
