"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();
  const todayISO = formatDateISO(today);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (months: number) => {
    const targetDate = addMonths(today, months);
    onDateChange(formatDateISO(targetDate));
    setViewDate(targetDate);
  };

  const handlePrevMonth = () => {
    setViewDate(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => addMonths(prev, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (newDate >= today) {
      onDateChange(formatDateISO(newDate));
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return days;
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date < today;
  };

  const isDateSelected = (day: number): boolean => {
    const dateISO = formatDateISO(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    return dateISO === selectedDate;
  };

  const isDateToday = (day: number): boolean => {
    const dateISO = formatDateISO(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    return dateISO === todayISO;
  };

  return (
    <div className="space-y-6">
      {/* Date display with custom picker */}
      <div className="relative" ref={pickerRef}>
        <label className="block text-sm text-gray-500 mb-2">
          Showing projections as of
        </label>

        {/* Clickable date display */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 hover:from-blue-100 hover:to-blue-150 transition-all w-full sm:w-auto text-left"
        >
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xl font-semibold text-gray-900 flex-1">
            {formatDisplayDate(selectedDate)}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Custom calendar dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-200 w-full sm:w-80">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-semibold text-gray-900">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar().map((day, index) => (
                <div key={index} className="aspect-square">
                  {day !== null && (
                    <button
                      type="button"
                      onClick={() => handleDateClick(day)}
                      disabled={isDateDisabled(day)}
                      className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors
                        ${isDateDisabled(day)
                          ? "text-gray-300 cursor-not-allowed"
                          : isDateSelected(day)
                          ? "bg-blue-600 text-white font-semibold"
                          : isDateToday(day)
                          ? "bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-sm text-gray-500 mb-2">Quick select</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const presetDate = formatDateISO(addMonths(today, preset.months));
            const isSelected = selectedDate === presetDate;

            return (
              <Button
                key={preset.label}
                type="button"
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handlePresetClick(preset.months)}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DateSelector;
