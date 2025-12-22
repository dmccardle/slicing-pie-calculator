import React from "react";

interface ToggleProps {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helperText?: string;
}

export function Toggle({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  helperText,
}: ToggleProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-start">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? "bg-blue-600" : "bg-gray-200"}
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
      {(label || helperText) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={id}
              className={`text-sm font-medium ${
                disabled ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {label}
            </label>
          )}
          {helperText && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Toggle;
