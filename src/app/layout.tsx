import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout";
import { AppProvider } from "@/context/AppContext";
import { SlicingPieProvider } from "@/context/SlicingPieContext";
import { FeatureFlagsProvider } from "@/context/FeatureFlagsContext";
import {
  ChartPieIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Slicing Pie Calculator",
  description: "Track equity contributions and calculate fair startup equity splits",
};

const navItems = [
  { label: "Dashboard", href: "/", icon: <ChartPieIcon className="h-5 w-5" /> },
  { label: "Contributors", href: "/contributors", icon: <UsersIcon className="h-5 w-5" /> },
  { label: "Contributions", href: "/contributions", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <FeatureFlagsProvider>
          <AppProvider>
            <SlicingPieProvider>
              <AppShell appName="Slicing Pie" navItems={navItems}>
                {children}
              </AppShell>
            </SlicingPieProvider>
          </AppProvider>
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}
