# Implementation Plan: Slicing Pie Equity Calculator

**Branch**: `001-slicing-pie-calculator` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-slicing-pie-calculator/spec.md`

## Summary

Build a Slicing Pie equity calculator that tracks contributor contributions, applies standard multipliers (Time: 2x, Cash: 4x, Non-cash: 2x, Ideas: 1x), and displays real-time equity distribution via pie chart. Built on the standalone-webapp-template with existing hooks (useLocalStorage, useEntities) and UI components.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Framework**: Next.js 15 (App Router) + React 19
**Primary Dependencies**: Tailwind CSS 4, Recharts (charts), xlsx (Excel), jsPDF (PDF)
**Storage**: Browser localStorage (local-first architecture)
**Testing**: Vitest + React Testing Library (inherited from template)
**Target Platform**: Web browser (responsive: mobile, tablet, desktop)
**Project Type**: web (Next.js App Router)
**Performance Goals**: Equity updates within 1 second of contribution logging
**Constraints**: Offline-capable, no backend required, <100 contributors/contributions typical
**Scale/Scope**: Single-user, local data, 3 main pages + settings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Architecture | PASS | localStorage only, no backend |
| II. Reusable Infrastructure | PASS | Uses existing useEntities, useLocalStorage hooks |
| III. Responsive Design | PASS | Mobile/Tablet/Desktop breakpoints required |
| IV. Export System | PASS | JSON/Excel/PDF via existing ExportPanel |
| V. Simplicity Over Features | PASS | No extra libraries, React Context + hooks only |
| VI. Technology Stack | PASS | Next.js 15, React 19, TS strict, Tailwind 4, Recharts |

**Gate Result**: PASS - All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-slicing-pie-calculator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Not needed (no API)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                    # Equity Dashboard (P1)
│   ├── layout.tsx                  # App layout with AppShell
│   ├── contributors/
│   │   └── page.tsx                # Contributors Management (P2)
│   ├── contributions/
│   │   └── page.tsx                # Contribution Logging & History (P3, P4)
│   └── settings/
│       └── page.tsx                # Settings with Export (P5)
├── components/
│   ├── layout/                     # (existing) AppShell, Header, Sidebar
│   ├── ui/                         # (existing) Button, Card, Modal, Table, Form
│   ├── charts/                     # (existing) PieChart, BarChart
│   ├── export/                     # (existing) ExportPanel
│   └── slicing-pie/                # NEW: Feature-specific components
│       ├── ContributorCard.tsx     # Contributor display with equity %
│       ├── ContributorForm.tsx     # Add/edit contributor modal
│       ├── ContributionForm.tsx    # Log contribution with type selection
│       ├── ContributionRow.tsx     # History table row
│       ├── EquitySummary.tsx       # Dashboard summary cards
│       └── OnboardingModal.tsx     # First-time user sample data prompt
├── context/
│   ├── AppContext.tsx              # (existing) Generic app state
│   └── SlicingPieContext.tsx       # NEW: Slicing Pie specific state
├── hooks/
│   ├── useLocalStorage.ts          # (existing) SSR-safe localStorage
│   ├── useEntities.ts              # (existing) Generic CRUD
│   └── useSlicingPie.ts            # NEW: Equity calculations hook
├── types/
│   ├── index.ts                    # (existing) Base types
│   └── slicingPie.ts               # NEW: Contributor, Contribution types
├── utils/
│   ├── helpers.ts                  # (existing) UUID, date formatting
│   ├── storage.ts                  # (existing) localStorage utilities
│   ├── exporters.ts                # (existing) JSON/Excel/PDF export
│   └── slicingPie.ts               # NEW: Multiplier calculations
└── lib/
    └── sampleData.ts               # NEW: Sample contributors/contributions
```

**Structure Decision**: Next.js App Router with feature-specific components in `src/components/slicing-pie/`. Reuses all existing template infrastructure.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
