# Research: Import/Export UI Improvements

**Feature**: 007-import-export-ui
**Date**: 2025-12-23

## Overview

This feature enhances existing UI components with no new technologies or external dependencies. Research focused on existing codebase patterns and best practices for confirmation dialogs.

## Research Tasks

### 1. Existing Import/Export Patterns

**Question**: How does the current import flow work?

**Findings**:
- `useExport` hook provides `importJSON()` function that opens file picker
- `validateImportData()` function validates JSON structure
- Import flows exist in: LocalStorageBanner, settings page, dashboard page
- Each location has its own confirmation modal implementation (not shared)

**Decision**: Create shared `ImportConfirmModal` component to consolidate all confirmation UIs
**Rationale**: Ensures consistency, reduces code duplication, easier to maintain
**Alternatives Rejected**:
- Keep separate modals: Violates DRY, inconsistent UX
- Inline confirmation without modal: Less safe, poor UX for destructive action

### 2. Confirmation Dialog Best Practices

**Question**: What UX patterns are recommended for destructive confirmations?

**Findings**:
- Users should explicitly opt-in before destructive actions
- Checkbox confirmation is more intentional than just clicking a button
- Offering data backup before destructive action is best practice
- Button should be disabled until confirmation is given

**Decision**: Require checkbox + offer download option before enabling Import button
**Rationale**: Prevents accidental data loss, follows established UX patterns
**Alternatives Rejected**:
- Text input confirmation (type "DELETE"): Overkill for this use case
- Timer-based delay: Frustrating UX

### 3. Onboarding Modal Patterns

**Question**: How should the onboarding modal be structured with three options?

**Findings**:
- Current modal has two options: "Load Sample Data" and "Start Empty"
- Import is most useful for returning users (should be prominent)
- Button order affects user attention (first = most attention)

**Decision**: Order buttons as Import Data (first), Start Empty (second), Sample Data (last)
**Rationale**: Prioritizes returning users who need to restore data
**Alternatives Rejected**:
- Keep current order + add Import last: Deprioritizes key use case
- Separate "returning user" flow: Over-engineering for this scope

### 4. Existing Component Patterns

**Question**: What existing components can be reused?

**Findings**:
- `Modal` component in `src/components/ui/Modal.tsx` - base modal wrapper
- `Button` component with variants (primary, secondary) and sizes
- `useExport` hook for JSON export functionality
- Existing checkbox styling in Tailwind

**Decision**: Compose new ImportConfirmModal using existing Modal and Button components
**Rationale**: Follows Constitution Principle II (Reusable Infrastructure)
**Alternatives Rejected**: None - this is the correct approach

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Confirmation component | Shared ImportConfirmModal | Consistency, DRY |
| Confirmation mechanism | Checkbox + disabled button | Prevents accidents |
| Backup option | "Download current data" button | Safety feature |
| Button order | Import, Empty, Sample | Prioritize returning users |
| Sample Data description | "See platform in action" | Clarify temporary nature |

## No Unknowns Remaining

All technical decisions are resolved using existing patterns. Ready for Phase 1 design.
