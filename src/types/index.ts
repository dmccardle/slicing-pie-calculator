/**
 * Core TypeScript types for the standalone web app template
 */

// Re-export PDF export types
export type {
  PDFExportOptions,
  ContributorSummaryRow,
  ContributionDetailRow,
  ContributorContributionsSection,
  VestingProjectionRow,
  PDFReportData,
} from "./pdfExport";
export { DEFAULT_PDF_EXPORT_OPTIONS } from "./pdfExport";

/**
 * Base entity interface - all entities extend this
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Application settings stored in localStorage
 */
export interface AppSettings {
  appName: string;
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
}

/**
 * Global application state
 */
export interface AppState {
  settings: AppSettings;
  isInitialized: boolean;
}

/**
 * Navigation item for sidebar
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

/**
 * Export format types
 */
export type ExportFormat = "json" | "excel" | "pdf";

/**
 * Chart data point for visualizations
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

/**
 * Sort direction for tables
 */
export type SortDirection = "asc" | "desc" | null;

/**
 * Modal props interface
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Button variants
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

/**
 * Button sizes
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Default app settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: "My App",
  theme: "system",
  sidebarCollapsed: false,
};
