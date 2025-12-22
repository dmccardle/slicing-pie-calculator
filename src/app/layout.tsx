import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout";
import { AppProvider } from "@/context/AppContext";
import { SlicingPieProvider } from "@/context/SlicingPieContext";

export const metadata: Metadata = {
  title: "Slicing Pie Calculator",
  description: "Track equity contributions and calculate fair startup equity splits",
};

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Contributors", href: "/contributors" },
  { label: "Contributions", href: "/contributions" },
  { label: "Settings", href: "/settings" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <SlicingPieProvider>
            <AppShell appName="Slicing Pie" navItems={navItems}>
              {children}
            </AppShell>
          </SlicingPieProvider>
        </AppProvider>
      </body>
    </html>
  );
}
