"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  const pathname = usePathname();
  const { vestingEnabled } = useFeatureFlagsContext();

  // Add Projections nav item when vesting is enabled
  const allNavItems = useMemo(() => {
    if (!vestingEnabled) return navItems;

    // Insert Projections after Contributors (before Settings)
    const settingsIndex = navItems.findIndex((item) => item.href === "/settings");
    const projectionsItem: NavItem = { label: "Projections", href: "/projections" };

    if (settingsIndex >= 0) {
      return [
        ...navItems.slice(0, settingsIndex),
        projectionsItem,
        ...navItems.slice(settingsIndex),
      ];
    }

    // If no settings found, just append
    return [...navItems, projectionsItem];
  }, [navItems, vestingEnabled]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-60
          transform border-r border-gray-200 bg-white
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        aria-label="Sidebar navigation"
      >
        <nav className="flex h-full flex-col p-4">
          <ul className="flex flex-col gap-1">
            {allNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors duration-150 cursor-pointer
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon && (
                      <span className="h-5 w-5 flex-shrink-0">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
