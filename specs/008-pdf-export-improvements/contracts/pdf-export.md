# Contract: PDF Export Components

**Feature**: 008-pdf-export-improvements
**Date**: 2025-12-23

## Overview

This document defines the interfaces and contracts for the PDF export enhancement components.

---

## 1. PDFExportOptions Component

### Purpose
Renders toggle controls for PDF export configuration.

### Props Interface

```typescript
interface PDFExportOptionsProps {
  /** Current export options state */
  options: PDFExportOptions;

  /** Callback when options change */
  onChange: (options: PDFExportOptions) => void;

  /** Whether valuation data is available (has valuation set) */
  valuationAvailable: boolean;

  /** Whether vesting feature is enabled */
  vestingEnabled: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### Behavior Contract

| Condition | Expected Behavior |
|-----------|-------------------|
| `valuationAvailable === false` | "Include valuation" toggle is disabled with tooltip explaining why |
| `vestingEnabled === false` | "Include vesting" toggle is not rendered |
| Toggle changed | `onChange` called with updated options object |

### Render Contract

```text
┌─────────────────────────────────────────────┐
│ PDF Export Options                          │
├─────────────────────────────────────────────┤
│ [x] Include contributions breakdown         │
│     Show detailed list of all contributions │
├─────────────────────────────────────────────┤
│ [ ] Include valuation (disabled)            │
│     Set a company valuation first           │
├─────────────────────────────────────────────┤
│ [ ] Include vesting breakdown               │
│     Show vested/unvested equity             │
└─────────────────────────────────────────────┘
```

---

## 2. usePDFExport Hook

### Purpose
Encapsulates PDF generation logic with progress tracking.

### Interface

```typescript
interface UsePDFExportReturn {
  /** Current export status */
  status: 'idle' | 'preparing' | 'rendering' | 'complete' | 'error';

  /** Error message if status is 'error' */
  error: string | null;

  /** Progress percentage (0-100) */
  progress: number;

  /** Trigger PDF export with given options */
  exportPDF: (options: PDFExportOptions) => Promise<void>;

  /** Cancel ongoing export */
  cancel: () => void;
}

function usePDFExport(
  company: Company,
  contributors: Contributor[],
  contributions: Contribution[],
  valuationConfig: ValuationConfig | null
): UsePDFExportReturn;
```

### Status Flow

```text
idle → preparing → rendering → complete
         ↓            ↓
       error        error
```

### Progress Stages

| Stage | Progress | Description |
|-------|----------|-------------|
| Formatting data | 0-20% | Transform entities to PDF data |
| Rendering chart | 20-50% | Convert chart to image |
| Building tables | 50-80% | Generate table sections |
| Finalizing | 80-100% | Compile and save PDF |

---

## 3. pdfChartRenderer Utility

### Purpose
Converts a rendered chart DOM element to a PNG data URL.

### Interface

```typescript
interface ChartRenderOptions {
  /** Width of the output image in pixels */
  width: number;

  /** Height of the output image in pixels */
  height: number;

  /** Background color (default: '#ffffff') */
  backgroundColor?: string;

  /** Scale factor for resolution (default: 2 for retina) */
  scale?: number;
}

/**
 * Renders a chart element to a PNG data URL
 * @param element - DOM element containing the chart
 * @param options - Render configuration
 * @returns PNG data URL string
 */
async function renderChartToImage(
  element: HTMLElement,
  options: ChartRenderOptions
): Promise<string>;
```

### Behavior Contract

| Input | Output |
|-------|--------|
| Valid DOM element with chart | PNG data URL (base64 encoded) |
| Invalid/null element | Throws Error('Chart element not found') |
| Element not yet rendered | Throws Error('Chart not ready for capture') |

---

## 4. pdfDataFormatter Utility

### Purpose
Transforms raw entity data into formatted PDF report data.

### Interface

```typescript
/**
 * Formats all data needed for PDF generation
 */
function formatPDFReportData(
  company: Company,
  contributors: Contributor[],
  contributions: Contribution[],
  valuationConfig: ValuationConfig | null,
  options: PDFExportOptions
): PDFReportData;

/**
 * Formats a contributor's summary row
 */
function formatContributorSummary(
  contributor: Contributor,
  contributions: Contribution[],
  totalSlices: number,
  valuation: number | null,
  includeVesting: boolean
): ContributorSummaryRow;

/**
 * Formats contribution detail rows for a contributor
 */
function formatContributionDetails(
  contributions: Contribution[]
): ContributionDetailRow[];

/**
 * Calculates vesting projections for all contributors
 */
function calculateVestingProjections(
  contributors: Contributor[],
  contributions: Contribution[]
): VestingProjectionRow[];
```

### Formatting Rules

| Field | Format |
|-------|--------|
| Date | `YYYY-MM-DD` |
| Currency | `$X,XXX.XX` (locale-aware) |
| Percentage | `XX.X%` |
| Slices | `X,XXX` (with thousands separator) |
| Time value | `X hours` |
| Cash value | `$X,XXX` |

---

## 5. Enhanced exportToPDF Function

### Purpose
Extended PDF export function supporting charts and configurable sections.

### Interface

```typescript
interface EnhancedPDFOptions {
  /** Report data */
  data: PDFReportData;

  /** Chart image as data URL (optional) */
  chartImage?: string;

  /** Export options */
  options: PDFExportOptions;

  /** Output filename (without extension) */
  filename: string;
}

/**
 * Generates and downloads an enhanced PDF report
 */
async function exportEnhancedPDF(options: EnhancedPDFOptions): Promise<void>;
```

### PDF Structure

```text
Section 1: Header
├── Company name (18pt, bold)
├── "Equity Report" subtitle (14pt)
└── Generated date (10pt, gray)

Section 2: Pie Chart (if chartImage provided)
├── Chart image centered
└── 15px bottom margin

Section 3: Summary Table
├── Table title: "Equity Summary"
├── Columns: Name | Slices | % [| Value | Vested | Unvested]
├── Data rows (striped)
└── Total row (bold)

Section 4: Contributions Breakdown (if enabled)
├── Section title: "Contributions Breakdown"
├── For each contributor:
│   ├── Contributor header with subtotal
│   └── Contribution table (Date | Type | Description | Value | Slices)

Section 5: Vesting Projections (if enabled)
├── Section title: "Vesting Projections"
└── Table: Date | Contributor | Vested | Unvested | %
```

---

## 6. Integration Points

### ExportPanel Enhancement

The existing `ExportPanel` component will be extended to:

1. Accept `PDFExportOptions` as optional prop
2. Show "PDF Options" expandable section when PDF export is available
3. Pass options to enhanced PDF export function

### Dashboard Integration

The main dashboard page will:

1. Provide PDF export with options through existing export locations
2. Pass current valuation and vesting state to determine available options

### Settings Page Integration

The settings page export section will:

1. Include full PDF options panel
2. Show preview of what will be included in export
