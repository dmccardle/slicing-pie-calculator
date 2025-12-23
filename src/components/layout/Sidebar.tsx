"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  const pathname = usePathname();
  const { vestingActive, valuationActive } = useFeatureFlagsContext();

  // Add conditional nav items based on feature flags (both available AND enabled)
  const allNavItems = useMemo(() => {
    let items = [...navItems];
    const settingsIndex = items.findIndex((item) => item.href === "/settings");

    // Add Projections when vesting is active (available AND enabled)
    if (vestingActive) {
      const projectionsItem: NavItem = {
        label: "Projections",
        href: "/projections",
        icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
      };
      if (settingsIndex >= 0) {
        items = [
          ...items.slice(0, settingsIndex),
          projectionsItem,
          ...items.slice(settingsIndex),
        ];
      } else {
        items = [...items, projectionsItem];
      }
    }

    // Add Equity Values when valuation is active (available AND enabled)
    if (valuationActive) {
      const equityValuesItem: NavItem = {
        label: "Equity Values",
        href: "/equity-values",
        icon: <CurrencyDollarIcon className="h-5 w-5" />,
      };
      // Find settings index again after possible insertion
      const newSettingsIndex = items.findIndex((item) => item.href === "/settings");
      if (newSettingsIndex >= 0) {
        items = [
          ...items.slice(0, newSettingsIndex),
          equityValuesItem,
          ...items.slice(newSettingsIndex),
        ];
      } else {
        items = [...items, equityValuesItem];
      }
    }

    // Add Deleted Items (always available, before Settings)
    const deletedItem: NavItem = {
      label: "Deleted Items",
      href: "/deleted",
      icon: <TrashIcon className="h-5 w-5" />,
    };
    const finalSettingsIndex = items.findIndex((item) => item.href === "/settings");
    if (finalSettingsIndex >= 0) {
      items = [
        ...items.slice(0, finalSettingsIndex),
        deletedItem,
        ...items.slice(finalSettingsIndex),
      ];
    } else {
      items = [...items, deletedItem];
    }

    return items;
  }, [navItems, vestingActive, valuationActive]);

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
