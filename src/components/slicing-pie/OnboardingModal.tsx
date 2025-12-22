"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onStartEmpty: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onLoadSampleData,
  onStartEmpty,
}: OnboardingModalProps) {
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
              Log contributions (time, cash, non-cash, ideas)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-600">3.</span>
              Watch the equity pie update in real-time
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              onLoadSampleData();
              onClose();
            }}
          >
            Load Sample Data
            <span className="ml-2 text-xs opacity-75">
              Explore with example data
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
            Start Empty
            <span className="ml-2 text-xs opacity-75">
              Add your own contributors
            </span>
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          All data is stored locally in your browser.
        </p>
      </div>
    </Modal>
  );
}

export default OnboardingModal;
