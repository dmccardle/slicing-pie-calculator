"use client";

import React, { useId } from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Checkbox({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className="w-full">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={`
            mt-1 h-4 w-4 rounded border-gray-300
            text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
          }
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className="text-sm text-gray-700 select-none cursor-pointer hover:text-gray-900"
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${checkboxId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Checkbox;
