"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ImportData {
  company: { name: string };
  contributors: unknown[];
  contributions: unknown[];
}

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onExportCurrent?: () => void;
  importData: ImportData | null;
  hasExistingData?: boolean;
}

export function ImportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onExportCurrent,
  importData,
  hasExistingData = false,
}: ImportConfirmModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset checkbox when modal closes
  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      setIsConfirmed(false);
      onConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Import">
      <div className="space-y-4">
        <p className="text-gray-600">
          This will replace all your current data with the imported file.
        </p>

        {importData && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">
              {importData.company.name || "Unnamed Company"}
            </p>
            <p className="text-gray-600">
              {importData.contributors.length} contributor(s),{" "}
              {importData.contributions.length} contribution(s)
            </p>
          </div>
        )}

        {hasExistingData && onExportCurrent && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-700 mb-2">
              You have existing data that will be replaced.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportCurrent}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download current data first
            </Button>
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-amber-200 bg-amber-50 p-3">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-amber-800">
            I understand this will permanently replace all my current data
          </span>
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ImportConfirmModal;
