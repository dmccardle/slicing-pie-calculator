# Data Model: Improved PDF Export

**Feature**: 008-pdf-export-improvements
**Date**: 2025-12-23

## Overview

This feature introduces types for PDF export configuration and data transformation. No new persistent entities are created - all types are transient and used only during PDF generation.

---

## New Types

### PDFExportOptions

Configuration for what to include in the PDF export.

```typescript
interface PDFExportOptions {
  /** Include detailed contributions breakdown by contributor */
  includeContributionsBreakdown: boolean;

  /** Include dollar values (requires valuation to be set) */
  includeValuation: boolean;

  /** Include vesting breakdown and projections (requires vesting feature) */
  includeVesting: boolean;
}
```

**Default Values**:
- `includeContributionsBreakdown`: `true`
- `includeValuation`: `false` (only available when valuation is configured)
- `includeVesting`: `false` (only available when vesting feature is active)

**Validation Rules**:
- `includeValuation` can only be `true` if company has a valuation set
- `includeVesting` can only be `true` if vesting feature flag is enabled

---

### ContributorSummaryRow

Formatted row for the summary table in the PDF.

```typescript
interface ContributorSummaryRow {
  /** Contributor display name */
  name: string;

  /** Total slices earned */
  totalSlices: number;

  /** Percentage of total pie (0-100) */
  percentage: number;

  /** Dollar value of equity (only when valuation included) */
  dollarValue?: number;

  /** Currently vested slices (only when vesting included) */
  vestedSlices?: number;

  /** Currently unvested slices (only when vesting included) */
  unvestedSlices?: number;

  /** Vesting status text (e.g., "Past cliff", "In cliff period") */
  vestingStatus?: string;
}
```

**Computed From**:
- `Contributor` entity (name)
- `Contribution[]` entities (totalSlices, percentage)
- `ValuationConfig` (dollarValue)
- `VestingSchedule` on contributor (vestedSlices, unvestedSlices, vestingStatus)

---

### ContributionDetailRow

Formatted row for the contributions breakdown table.

```typescript
interface ContributionDetailRow {
  /** Date of contribution (formatted string) */
  date: string;

  /** Contribution type (Time, Cash, Non-Cash, Ideas, Relationships) */
  type: string;

  /** Description of the contribution */
  description: string;

  /** Raw value (hours, dollars, etc.) */
  value: number;

  /** Formatted value with unit (e.g., "10 hours", "$500") */
  formattedValue: string;

  /** Slices earned for this contribution */
  slices: number;
}
```

**Computed From**:
- `Contribution` entity

---

### ContributorContributionsSection

A section in the PDF showing one contributor's contributions.

```typescript
interface ContributorContributionsSection {
  /** Contributor name (section header) */
  contributorName: string;

  /** Subtotal of slices for this contributor */
  subtotalSlices: number;

  /** Individual contribution rows */
  contributions: ContributionDetailRow[];
}
```

---

### VestingProjectionRow

Row for the vesting projections table.

```typescript
interface VestingProjectionRow {
  /** Projection date (formatted string) */
  date: string;

  /** Contributor name */
  contributorName: string;

  /** Projected vested slices at this date */
  vestedSlices: number;

  /** Projected unvested slices at this date */
  unvestedSlices: number;

  /** Vested percentage at this date */
  vestedPercentage: number;
}
```

**Projection Intervals**: 6 months, calculated for next 2 years (5 data points: 6mo, 12mo, 18mo, 24mo)

---

### PDFReportData

Complete data structure for generating the PDF report.

```typescript
interface PDFReportData {
  /** Company name for header */
  companyName: string;

  /** Export date (ISO string) */
  exportDate: string;

  /** Chart data for pie chart (name, value, color) */
  chartData: ChartDataPoint[];

  /** Summary table rows */
  summaryRows: ContributorSummaryRow[];

  /** Total slices across all contributors */
  totalSlices: number;

  /** Company valuation in dollars (optional) */
  companyValuation?: number;

  /** Contributions breakdown sections (optional) */
  contributionsSections?: ContributorContributionsSection[];

  /** Vesting projections (optional) */
  vestingProjections?: VestingProjectionRow[];
}
```

---

## Existing Types (Referenced)

These types already exist in the codebase and are used as input:

### ChartDataPoint (from `src/types/index.ts`)

```typescript
interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
```

### Contributor (from `src/types/slicingPie.ts`)

```typescript
interface Contributor {
  id: string;
  name: string;
  hourlyRate: number;
  // ... other fields
  vesting?: VestingSchedule;
}
```

### Contribution (from `src/types/slicingPie.ts`)

```typescript
interface Contribution {
  id: string;
  contributorId: string;
  type: ContributionType;
  value: number;
  slices: number;
  description?: string;
  date: string;
  // ... other fields
}
```

### ValuationConfig (from `src/types/valuation.ts`)

```typescript
interface ValuationConfig {
  mode: 'manual' | 'auto';
  manualValue: number | null;
  businessMetrics: BusinessMetrics | null;
  // ... other fields
}
```

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                        localStorage                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Company  │  │ Contributors │  │Contributions│  │Valuation │ │
│  └────┬─────┘  └──────┬───────┘  └──────┬──────┘  └────┬─────┘ │
└───────┼───────────────┼─────────────────┼──────────────┼────────┘
        │               │                 │              │
        ▼               ▼                 ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   pdfDataFormatter.ts                           │
│  formatPDFReportData(company, contributors, contributions,      │
│                      valuation, options) → PDFReportData        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PDFReportBuilder.tsx                          │
│  Uses PDFReportData + pdfChartRenderer to generate jsPDF doc    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         PDF Download
```

---

## Type Location

All new types will be defined in:

```
src/types/pdfExport.ts
```

And re-exported from:

```
src/types/index.ts
```
