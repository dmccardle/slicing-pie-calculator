"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

// Preset date shortcuts
const PRESETS = [
  { label: "Today", months: 0 },
  { label: "6 months", months: 6 },
  { label: "1 year", months: 12 },
  { label: "2 years", months: 24 },
  { label: "5 years", months: 60 },
];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();

  const handlePresetClick = (months: number) => {
    const targetDate = addMonths(today, months);
    onDateChange(formatDateISO(targetDate));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const presetDate = formatDateISO(addMonths(today, preset.months));
          const isSelected = selectedDate === presetDate;

          return (
            <Button
              key={preset.label}
              type="button"
              variant={isSelected ? "primary" : "secondary"}
              size="sm"
              onClick={() => handlePresetClick(preset.months)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Or select a custom date:</span>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={formatDateISO(today)}
          max={formatDateISO(addMonths(today, 120))} // Max 10 years
          className="w-auto"
        />
      </div>

      <p className="text-sm text-gray-600">
        Showing projected equity distribution as of{" "}
        <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
      </p>
    </div>
  );
}

export default DateSelector;
