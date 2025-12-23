"use client";

import React, { useState } from "react";
import { Button, Modal, Checkbox } from "@/components/ui";

/**
 * Inline disclaimer warning displayed on valuation screens
 */
export function ValuationDisclaimer() {
  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-amber-800">
            Important Disclaimer
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            The valuations shown here are <strong>rough estimates for discussion purposes only</strong>.
            They are NOT official legal valuations and should NOT be used for:
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-amber-700 space-y-1">
            <li>Legal agreements or contracts</li>
            <li>Tax filings or financial reporting</li>
            <li>Investment decisions or fundraising</li>
            <li>Any formal business transactions</li>
          </ul>
          <p className="mt-2 text-sm text-amber-700">
            For official valuations, please consult a qualified business appraiser,
            accountant, or legal professional.
          </p>
        </div>
      </div>
    </div>
  );
}

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

/**
 * Modal for first-time disclaimer acknowledgment
 */
export function DisclaimerModal({ isOpen, onClose, onAccept }: DisclaimerModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAccept = () => {
    if (acknowledged) {
      onAccept();
    }
  };

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Valuation Disclaimer"
    >
      <div className="space-y-4">
        <ValuationDisclaimer />

        <div className="border-t border-gray-200 pt-4">
          <Checkbox
            id="disclaimer-acknowledgment"
            label="I understand and acknowledge this disclaimer"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <p className="mt-2 text-xs text-gray-500">
            By checking this box, you confirm that you understand the valuations
            are estimates only and should not be used for official purposes.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!acknowledged}
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ValuationDisclaimer;
