"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { NavItem } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  appName?: string;
  navItems?: NavItem[];
}

// Default navigation items
const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Settings", href: "/settings" },
];

export function AppShell({
  children,
  appName = "My App",
  navItems = defaultNavItems,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        appName={appName}
        onMenuToggle={handleMenuToggle}
        isSidebarOpen={isSidebarOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        navItems={navItems}
      />

      {/* Main content */}
      <main className="pt-16 lg:pl-60">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
