# Tasks: Company Valuation Configuration

**Input**: Design documents from `/specs/004-company-valuation/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create type definitions and base utilities needed by all user stories

- [X] T001 Create valuation type definitions (ValuationConfig, BusinessMetrics, ValuationHistoryEntry, EquityValueRow) in src/types/valuation.ts
- [X] T002 [P] Create valuation utility functions (formatCurrency, formatCompactNumber, centsToDollars, dollarsToCents) in src/utils/valuation.ts
- [X] T003 [P] Add valuation calculation functions (calculateValuation, calculateGrowthMultiplier, calculateRetentionMultiplier, getConfidenceLevel) in src/utils/valuation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and context that MUST be complete before user story UI work

**CRITICAL**: No user story UI can begin until this phase is complete

- [X] T004 Create useValuation hook with localStorage persistence in src/hooks/useValuation.ts
- [X] T005 Add valuation history management functions (addHistoryEntry, getHistory, restoreFromHistory) to src/hooks/useValuation.ts
- [X] T006 [P] Add valuationEnabled flag to FeatureFlags interface in src/hooks/useFeatureFlags.ts
- [X] T007 [P] Add NEXT_PUBLIC_VALUATION_ENABLED environment variable support in src/hooks/useFeatureFlags.ts
- [X] T008 Update FeatureFlagsContext to include valuationEnabled and setValuationEnabled in src/context/FeatureFlagsContext.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enable Valuation Mode (Priority: P1)

**Goal**: Toggle valuation feature on/off, hiding all valuation UI when disabled

**Independent Test**: Toggle setting ON/OFF and verify Equity Values nav item appears/disappears

### Implementation for User Story 1

- [X] T009 [US1] Add "Enable Valuation" toggle to Settings page in src/app/settings/page.tsx
- [X] T010 [US1] Update Sidebar to conditionally render "Equity Values" nav item based on valuationEnabled flag in src/components/layout/Sidebar.tsx
- [X] T011 [US1] Verify environment variable default works by testing with NEXT_PUBLIC_VALUATION_ENABLED=true

**Checkpoint**: Feature flag controls visibility of valuation UI

---

## Phase 4: User Story 2 - Manual Valuation Entry (Priority: P1)

**Goal**: Allow manual entry of company valuation amount

**Independent Test**: Enter $500,000 valuation, verify it saves and displays correctly

### Implementation for User Story 2

- [X] T012 [US2] Create ValuationConfig component with manual/auto mode toggle and manual value input in src/components/valuation/ValuationConfig.tsx
- [X] T013 [US2] Add manual valuation input with dollar formatting and validation (positive numbers only) in src/components/valuation/ValuationConfig.tsx
- [X] T014 [US2] Integrate ValuationConfig into Settings page valuation section in src/app/settings/page.tsx
- [X] T015 [US2] Add save confirmation feedback when valuation is saved

**Checkpoint**: Users can enter and save manual valuation

---

## Phase 5: User Story 3 - Legal Disclaimer Display (Priority: P1)

**Goal**: Display prominent legal disclaimer on all valuation screens with first-time acknowledgment

**Independent Test**: First save triggers modal with checkbox; subsequent saves don't require acknowledgment

### Implementation for User Story 3

- [X] T016 [US3] Create ValuationDisclaimer component with warning text and styling in src/components/valuation/ValuationDisclaimer.tsx
- [X] T017 [US3] Create DisclaimerModal component with checkbox acknowledgment and Accept button in src/components/valuation/ValuationDisclaimer.tsx
- [X] T018 [US3] Add disclaimer display to ValuationConfig component in src/components/valuation/ValuationConfig.tsx
- [X] T019 [US3] Integrate first-time acknowledgment flow into save action (show modal if not acknowledged) in src/components/valuation/ValuationConfig.tsx
- [X] T020 [US3] Store disclaimerAcknowledged flag in ValuationConfig via useValuation hook

**Checkpoint**: Legal disclaimer visible on all valuation screens, acknowledgment required on first save

---

## Phase 6: User Story 4 - Auto-Calculated Valuation (Priority: P2)

**Goal**: Calculate valuation from business metrics (net profit, growth, churn)

**Independent Test**: Enter profit data and churn rate, verify calculated valuation displays with formula explanation

### Implementation for User Story 4

- [X] T021 [US4] Create BusinessMetricsForm component with current year profit input in src/components/valuation/BusinessMetricsForm.tsx
- [X] T022 [US4] Add historical profit year inputs (up to 5 years) with add/remove functionality in src/components/valuation/BusinessMetricsForm.tsx
- [X] T023 [US4] Add churn rate percentage input with 0-100 validation in src/components/valuation/BusinessMetricsForm.tsx
- [X] T024 [US4] Display calculated valuation with confidence indicator (High/Medium/Low) in src/components/valuation/BusinessMetricsForm.tsx
- [X] T025 [US4] Add formula explanation tooltip/expandable section showing calculation breakdown in src/components/valuation/BusinessMetricsForm.tsx
- [X] T026 [US4] Integrate BusinessMetricsForm into ValuationConfig when auto mode selected in src/components/valuation/ValuationConfig.tsx

**Checkpoint**: Auto-calculation works with confidence indicator based on data completeness

---

## Phase 7: User Story 5 - Equity Values Page (Priority: P2)

**Goal**: Dedicated page with sortable table showing contributor equity in dollar terms

**Independent Test**: Navigate to page, verify table displays with sorting on all columns

### Implementation for User Story 5

- [X] T027 [P] [US5] Create generic SortableTable component with column headers, sort indicators, and click-to-sort in src/components/ui/SortableTable.tsx
- [X] T028 [US5] Create Equity Values page with header and disclaimer note in src/app/equity-values/page.tsx
- [X] T029 [US5] Implement EquityValueRow computation from contributors and valuation in src/app/equity-values/page.tsx
- [X] T030 [US5] Display sortable table with columns: Name, Slices, Percentage, Total Value in src/app/equity-values/page.tsx
- [X] T031 [US5] Add Vested Value column when vesting feature is enabled in src/app/equity-values/page.tsx
- [X] T032 [US5] Add empty state when no valuation configured with link to settings in src/app/equity-values/page.tsx
- [X] T033 [US5] Ensure responsive design (table scrolls horizontally on mobile, sticky header) in src/app/equity-values/page.tsx

**Checkpoint**: Equity Values page fully functional with sortable columns

---

## Phase 8: User Story 6 - Valuation History Tracking (Priority: P4)

**Goal**: Track valuation changes over time with ability to restore previous values

**Independent Test**: Change valuation 3 times, verify history shows all entries, restore works

### Implementation for User Story 6

- [X] T034 [US6] Create ValuationHistory component displaying past valuations with timestamps in src/components/valuation/ValuationHistory.tsx
- [X] T035 [US6] Add visual trend indicator (arrow up/down) between history entries in src/components/valuation/ValuationHistory.tsx
- [X] T036 [US6] Add restore button for each history entry that loads previous configuration in src/components/valuation/ValuationHistory.tsx
- [X] T037 [US6] Integrate ValuationHistory into Settings valuation section in src/app/settings/page.tsx
- [X] T038 [US6] Implement FIFO eviction when history exceeds 20 entries in src/hooks/useValuation.ts

**Checkpoint**: Valuation history displays and restore functionality works

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T039 Verify all number formatting uses compact notation ($1.2M, $500K) across all components
- [X] T040 Test responsive design at mobile (<640px), tablet (640-1024px), and desktop (>1024px) breakpoints
- [X] T041 Verify feature flag completely hides all valuation UI when disabled
- [X] T042 Run quickstart.md test scenarios to validate all acceptance criteria
- [X] T043 Build and verify no TypeScript or ESLint errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 - enables feature flag
- **US2 (Phase 4)**: Depends on Phase 2 - can run parallel with US1
- **US3 (Phase 5)**: Depends on US2 (disclaimer shown on config) - should complete with US2
- **US4 (Phase 6)**: Depends on Phase 2 - can start after foundational
- **US5 (Phase 7)**: Depends on Phase 2 + valuation set - can start after foundational
- **US6 (Phase 8)**: Depends on Phase 2 - lowest priority, can be done last
- **Polish (Phase 9)**: Depends on all desired stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ─────────────────────────┐
    ↓                                           │
    ├── US1 (Feature Flag) ←────────────────────┤
    │       ↓                                   │
    ├── US2 (Manual Valuation) ←────────────────┤
    │       ↓                                   │
    ├── US3 (Disclaimer) ← depends on US2       │
    │                                           │
    ├── US4 (Auto-Calc) ←───────────────────────┤
    │                                           │
    ├── US5 (Equity Values Page) ←──────────────┤
    │                                           │
    └── US6 (History) ←─────────────────────────┘
            ↓
      Phase 9 (Polish)
```

### Parallel Opportunities

```bash
# Phase 1: All can run in parallel
Task: T001 (types)
Task: T002 (formatters) [P]
Task: T003 (calculations) [P]

# Phase 2: These can run in parallel
Task: T006 (feature flags hook) [P]
Task: T007 (env var support) [P]

# After Phase 2: These user stories can start in parallel
US1: Feature Flag Toggle
US2: Manual Valuation
US4: Auto-Calculate
US5: Equity Values Page
US6: History Tracking

# US5: SortableTable can be built in parallel with other US5 tasks
Task: T027 (SortableTable) [P]
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (types, utilities)
2. Complete Phase 2: Foundational (hooks, context)
3. Complete Phase 3: US1 (feature toggle)
4. Complete Phase 4: US2 (manual valuation)
5. Complete Phase 5: US3 (disclaimer)
6. **STOP and VALIDATE**: Core valuation entry works with legal protection
7. Deploy/demo if ready

### Full Feature Delivery

1. Complete MVP (US1-3)
2. Add US4: Auto-calculated valuation
3. Add US5: Equity Values page
4. Add US6: History tracking
5. Complete Polish phase
6. Full feature ready

---

## Task Summary

| Phase | Description | Tasks | Parallel |
|-------|-------------|-------|----------|
| 1 | Setup | 3 | 2 |
| 2 | Foundational | 5 | 2 |
| 3 | US1: Feature Flag | 3 | 0 |
| 4 | US2: Manual Entry | 4 | 0 |
| 5 | US3: Disclaimer | 5 | 0 |
| 6 | US4: Auto-Calc | 6 | 0 |
| 7 | US5: Equity Page | 7 | 1 |
| 8 | US6: History | 5 | 0 |
| 9 | Polish | 5 | 0 |
| **Total** | | **43** | **5** |

---

## Notes

- All monetary values stored in cents (integers) - see data-model.md
- Use Intl.NumberFormat for compact notation ($1.2M)
- Feature flag pattern follows existing vestingEnabled implementation
- No tests requested in spec - tests omitted per template rules
- Commit after each task or logical group
