# Implementation Plan: Import/Export UI Improvements

**Branch**: `007-import-export-ui` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-import-export-ui/spec.md`

## Summary

Improve the import/export user experience by adding an Import Data option to the onboarding modal, requiring explicit confirmation via checkbox before import, and providing a "Download current data first" option for users with existing data. All import flows (onboarding, dashboard, settings) will use a shared confirmation modal component.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4
**Storage**: Browser localStorage (via existing useLocalStorage and useEntities hooks)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web browser (responsive: mobile, tablet, desktop)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Instant UI response, file operations complete in < 1 second
**Constraints**: Offline-capable after initial load, no external API dependencies
**Scale/Scope**: Single user, local data only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Local-First Architecture | PASS | Uses localStorage exclusively, no backend |
| II. Reusable Infrastructure | PASS | Creating reusable ImportConfirmModal component |
| III. Responsive Design | PASS | Modal components follow existing responsive patterns |
| IV. Export System | PASS | Enhances existing JSON export/import |
| V. Simplicity Over Features | PASS | Using React Context + hooks, Tailwind CSS |
| VI. Technology Stack | PASS | TypeScript, Next.js, React, Tailwind only |

**Gate Status**: PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/007-import-export-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no APIs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── slicing-pie/
│   │   ├── ImportConfirmModal.tsx    # NEW: Reusable confirmation modal
│   │   ├── OnboardingModal.tsx       # MODIFY: Add import option
│   │   └── LocalStorageBanner.tsx    # MODIFY: Use ImportConfirmModal
│   └── ui/
│       └── Modal.tsx                 # EXISTING: Base modal component
├── context/
│   └── SlicingPieContext.tsx         # EXISTING: importData function
├── hooks/
│   └── useExport.ts                  # EXISTING: Export functionality
└── app/
    ├── page.tsx                      # MODIFY: Pass import handler to onboarding
    └── settings/
        └── page.tsx                  # MODIFY: Use ImportConfirmModal
```

**Structure Decision**: Single Next.js web application following existing patterns. All changes are UI components with no backend.

## Complexity Tracking

> No violations. All implementations follow constitution principles.
