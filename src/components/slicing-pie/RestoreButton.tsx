"use client";

import React from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

interface RestoreButtonProps {
  onClick: () => void;
  size?: "sm" | "md";
  variant?: "button" | "icon";
  disabled?: boolean;
  label?: string;
}

export function RestoreButton({
  onClick,
  size = "sm",
  variant = "button",
  disabled = false,
  label = "Restore",
}: RestoreButtonProps) {
  const sizeClasses = {
    sm: variant === "button" ? "px-2 py-1 text-xs" : "p-1",
    md: variant === "button" ? "px-3 py-1.5 text-sm" : "p-1.5",
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          rounded text-green-600 hover:bg-green-100
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={label}
      >
        <ArrowUturnLeftIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-md bg-green-600 font-medium text-white
        hover:bg-green-700 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {label}
    </button>
  );
}

export default RestoreButton;
