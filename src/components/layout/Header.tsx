"use client";

import React from "react";

interface HeaderProps {
  appName: string;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function Header({ appName, onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Hamburger menu button - visible on mobile/tablet */}
      <button
        onClick={onMenuToggle}
        className="mr-4 rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden cursor-pointer"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={isSidebarOpen}
      >
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* App name */}
      <h1 className="text-xl font-semibold text-gray-900">{appName}</h1>

      {/* Right side - can be extended with user menu, notifications, etc. */}
      <div className="ml-auto flex items-center gap-4">
        {/* Placeholder for future header actions */}
      </div>
    </header>
  );
}

export default Header;
