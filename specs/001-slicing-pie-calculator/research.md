# Research: Slicing Pie Equity Calculator

**Date**: 2025-12-22
**Status**: Complete

## Overview

This feature builds on the standalone-webapp-template which already provides all required infrastructure. No external research is required as the technology stack and patterns are defined by the template constitution.

## Technology Decisions

### State Management

**Decision**: React Context + useEntities hook
**Rationale**: Template already provides useEntities for CRUD operations with localStorage persistence. Slicing Pie calculator adds a thin wrapper (useSlicingPie) for equity calculations.
**Alternatives Considered**:
- Redux/Zustand: Rejected per constitution (Principle V: Simplicity Over Features)
- Custom state management: Unnecessary - useEntities already handles entity CRUD

### Equity Calculation Approach

**Decision**: Pure functions in `utils/slicingPie.ts` with memoization in useSlicingPie hook
**Rationale**:
- Calculations are derived from stored data (contributions)
- Pure functions are testable and predictable
- useMemo prevents recalculation on every render
**Alternatives Considered**:
- Store calculated slices: Rejected - would require recalculation on hourly rate changes
- Calculate on render without memoization: Rejected - performance concern for large datasets

### Slicing Pie Multipliers

**Decision**: Use standard Slicing Pie model multipliers as constants
**Rationale**: Following Mike Moyer's Slicing Pie framework exactly as specified

| Type | Multiplier | Formula |
|------|------------|---------|
| Time (unpaid) | 2x | hours x hourlyRate x 2 |
| Cash | 4x | amount x 4 |
| Non-cash | 2x | fairMarketValue x 2 |
| Idea | 1x | negotiatedValue x 1 |
| Relationship | 1x | negotiatedValue x 1 |

### Contribution Type Handling

**Decision**: Single contribution entity with `type` discriminator field
**Rationale**: Simplifies CRUD operations - all contributions stored in one collection
**Alternatives Considered**:
- Separate entities per type: Rejected - adds complexity without benefit
- Different value field names per type: Rejected - harder to iterate/sum

### First-Time User Experience

**Decision**: Modal prompt on empty state offering sample data
**Rationale**: Shows value immediately without requiring data entry
**Alternatives Considered**:
- Tour/walkthrough: Rejected - over-engineering for simple app
- Pre-populated data: Rejected - confusing if user doesn't realize it's sample

## No Open Questions

All technical decisions are resolved. The implementation can proceed to data model design.
