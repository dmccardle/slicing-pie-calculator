# Implementation Plan: Improved PDF Export

**Branch**: `008-pdf-export-improvements` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-pdf-export-improvements/spec.md`

## Summary

Enhance the existing PDF export functionality to include visual pie chart representation of equity distribution, comprehensive summary tables, detailed contributions breakdown, and optional valuation/vesting data. The implementation extends the current jsPDF + autoTable approach by adding chart-to-image rendering and a configurable export options panel.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), React 19, jsPDF, jspdf-autotable, Recharts, html2canvas
**Storage**: Browser localStorage (via existing hooks)
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js frontend-only)
**Performance Goals**: PDF generation < 5 seconds for typical datasets
**Constraints**: Offline-capable, no external API calls, < 2MB PDF file size
**Scale/Scope**: Up to 20 contributors, 200 contributions per export

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Architecture | PASS | No backend required, all data from localStorage |
| II. Reusable Infrastructure | PASS | Will extend existing useExport hook, create reusable PDF builder |
| III. Responsive Design | PASS | Export options panel will be responsive |
| IV. Export System | PASS | Directly implements PDF export enhancement (constitution requirement) |
| V. Simplicity Over Features | PASS | Uses existing dependencies (jsPDF, Recharts), no new state management |
| VI. Technology Stack | PASS | Uses approved stack: Next.js, React, TypeScript, Tailwind, Recharts, jsPDF |

**Gate Status**: PASS - All principles satisfied, no violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/008-pdf-export-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output - chart rendering research
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - integration guide
├── contracts/           # Phase 1 output - component interfaces
│   └── pdf-export.md    # PDF export component contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── charts/
│   │   └── PieChart.tsx           # Existing - may need ref forwarding for export
│   ├── export/
│   │   ├── ExportPanel.tsx        # Existing - will be extended
│   │   ├── PDFExportOptions.tsx   # NEW - toggle controls for PDF options
│   │   └── PDFReportBuilder.tsx   # NEW - orchestrates PDF generation
│   └── slicing-pie/
│       └── LocalStorageBanner.tsx # Existing - uses ExportPanel
├── hooks/
│   ├── useExport.ts               # Existing - will add enhanced PDF method
│   └── usePDFExport.ts            # NEW - PDF-specific export logic
├── utils/
│   ├── exporters.ts               # Existing - extend exportToPDF function
│   ├── pdfChartRenderer.ts        # NEW - chart to image conversion
│   └── pdfDataFormatter.ts        # NEW - format data for PDF tables
└── types/
    ├── index.ts                   # Existing - add PDFExportOptions type
    └── pdfExport.ts               # NEW - PDF export specific types
```

**Structure Decision**: Single web application structure. New files follow existing patterns in the `src/components/export/`, `src/hooks/`, and `src/utils/` directories. All new components are placed alongside existing export functionality.

## Complexity Tracking

> No constitution violations - this section remains empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
