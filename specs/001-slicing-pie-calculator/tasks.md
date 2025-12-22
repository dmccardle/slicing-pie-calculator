# Tasks: Slicing Pie Equity Calculator

**Input**: Design documents from `/specs/001-slicing-pie-calculator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared types/utilities

- [X] T001 Create Slicing Pie TypeScript types in src/types/slicingPie.ts
- [X] T002 [P] Create multiplier constants and calculation functions in src/utils/slicingPie.ts
- [X] T003 [P] Create sample data for onboarding in src/lib/sampleData.ts
- [X] T004 Create SlicingPieContext with useEntities integration in src/context/SlicingPieContext.tsx
- [X] T005 Create useSlicingPie hook for equity calculations in src/hooks/useSlicingPie.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update navigation and layout for Slicing Pie app

- [X] T006 Update Sidebar navigation links for Dashboard, Contributors, Contributions, Settings in src/components/layout/Sidebar.tsx
- [X] T007 Update Header with app name "Slicing Pie" in src/components/layout/Header.tsx
- [X] T008 Update root layout to wrap app with SlicingPieContext in src/app/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Equity Dashboard (Priority: P1) MVP

**Goal**: Display real-time equity split via pie chart with summary cards

**Independent Test**: View dashboard with sample data, verify pie chart shows contributor names and equity percentages

### Implementation for User Story 1

- [X] T009 [P] [US1] Create EquitySummary component (total slices, contributor count, recent activity) in src/components/slicing-pie/EquitySummary.tsx
- [X] T010 [US1] Build Dashboard page with pie chart and summary cards in src/app/page.tsx
- [X] T011 [US1] Add empty state prompting to add contributors when no data exists in src/app/page.tsx
- [X] T012 [US1] Add hover tooltips on pie chart slices showing name, slices, percentage in src/app/page.tsx

**Checkpoint**: Dashboard displays equity distribution - MVP functional

---

## Phase 4: User Story 2 - Manage Contributors (Priority: P2)

**Goal**: Add, edit, and remove team members with hourly rates

**Independent Test**: Add contributor, verify in list, edit hourly rate, remove with confirmation

### Implementation for User Story 2

- [X] T013 [P] [US2] Create ContributorCard component (name, rate, slices, equity %) in src/components/slicing-pie/ContributorCard.tsx
- [X] T014 [P] [US2] Create ContributorForm modal (add/edit name, email, hourly rate) in src/components/slicing-pie/ContributorForm.tsx
- [X] T015 [US2] Build Contributors page with list and Add button in src/app/contributors/page.tsx
- [X] T016 [US2] Add edit functionality to ContributorCard in src/app/contributors/page.tsx
- [X] T017 [US2] Add delete with confirmation dialog in src/app/contributors/page.tsx

**Checkpoint**: Contributors can be fully managed - CRUD complete

---

## Phase 5: User Story 3 - Log Contributions (Priority: P3)

**Goal**: Log contributions with type-specific multipliers (Time 2x, Cash 4x, Non-cash 2x, Ideas 1x)

**Independent Test**: Select contributor, choose type, enter value, verify slice calculation matches formula

### Implementation for User Story 3

- [X] T018 [P] [US3] Create ContributionForm component with type selector and value input in src/components/slicing-pie/ContributionForm.tsx
- [X] T019 [US3] Add slice preview calculation to ContributionForm (show: value x multiplier = slices) in src/components/slicing-pie/ContributionForm.tsx
- [X] T020 [US3] Create Contributions page with Add Contribution button in src/app/contributions/page.tsx
- [X] T021 [US3] Wire ContributionForm to create contributions via context in src/app/contributions/page.tsx

**Checkpoint**: Contributions can be logged with correct multiplier calculations

---

## Phase 6: User Story 4 - View Contribution History (Priority: P4)

**Goal**: Display all contributions in a sortable, filterable table

**Independent Test**: View history table, sort by date/contributor/type, filter by contributor

### Implementation for User Story 4

- [X] T022 [P] [US4] Create ContributionRow component for table display in src/components/slicing-pie/ContributionRow.tsx
- [X] T023 [US4] Add contribution history table to Contributions page in src/app/contributions/page.tsx
- [X] T024 [US4] Add sorting by Date, Contributor, Type, Value, Slices columns in src/app/contributions/page.tsx
- [X] T025 [US4] Add filter dropdown for contributor selection in src/app/contributions/page.tsx
- [X] T026 [US4] Add filter dropdown for contribution type selection in src/app/contributions/page.tsx
- [X] T027 [US4] Add running total display showing filtered slice count in src/app/contributions/page.tsx

**Checkpoint**: Contribution history fully viewable with filtering and sorting

---

## Phase 7: User Story 5 - Export and Backup Data (Priority: P5)

**Goal**: Export data to JSON, Excel, PDF; import from JSON backup

**Independent Test**: Click each export button, verify files download with correct data

### Implementation for User Story 5

- [X] T028 [US5] Customize exportToExcel for Slicing Pie (Summary, Contributors, Contributions sheets) in src/utils/exporters.ts
- [X] T029 [US5] Customize exportToPDF for Slicing Pie (equity summary with pie chart) in src/utils/exporters.ts
- [X] T030 [US5] Update Settings page with ExportPanel for Slicing Pie data in src/app/settings/page.tsx
- [X] T031 [US5] Add JSON import validation for SlicingPieData structure in src/app/settings/page.tsx
- [X] T032 [US5] Add "Clear All Data" button with confirmation in src/app/settings/page.tsx

**Checkpoint**: Data can be exported in all formats and restored from backup

---

## Phase 8: User Story 6 - First-Time User Onboarding (Priority: P6)

**Goal**: Show sample data option for new users

**Independent Test**: Open app with no data, load sample data, explore, clear sample data

### Implementation for User Story 6

- [X] T033 [P] [US6] Create OnboardingModal component (Load Sample Data / Start Empty options) in src/components/slicing-pie/OnboardingModal.tsx
- [X] T034 [US6] Add first-time detection logic (check for empty localStorage) in src/context/SlicingPieContext.tsx
- [X] T035 [US6] Show OnboardingModal on Dashboard when no data and not dismissed in src/app/page.tsx
- [X] T036 [US6] Add "Load Sample Data" function using sampleData.ts in src/context/SlicingPieContext.tsx
- [X] T037 [US6] Add "Clear Sample Data" indicator and action in src/app/settings/page.tsx

**Checkpoint**: New users can explore with sample data before entering their own

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all user stories

- [X] T038 Run build and fix any TypeScript/ESLint errors
- [X] T039 Test responsive design at mobile (<640px), tablet (640-1024px), desktop (>1024px) breakpoints
- [X] T040 Run through all quickstart.md scenarios to validate functionality
- [X] T041 Update README.md with Slicing Pie app description and usage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001, T004, T005 (types, context, hook)
- **User Stories (Phase 3-8)**: All depend on Phase 2 completion
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|-----------|-----------------|
| US1 (Dashboard) | Phase 2 | T008 |
| US2 (Contributors) | Phase 2 | T008 |
| US3 (Contributions) | US2 (needs contributors to log against) | T017 |
| US4 (History) | US3 (needs contributions to display) | T021 |
| US5 (Export) | US2, US3 (needs data to export) | T021 |
| US6 (Onboarding) | US1 (shows on dashboard) | T012 |

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002 (calculations) and T003 (sample data) can run in parallel
```

**Phase 3 (US1 Dashboard)**:
```
T009 (EquitySummary) can start while T010 is being planned
```

**Phase 4 (US2 Contributors)**:
```
T013 (ContributorCard) and T014 (ContributorForm) can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 3)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: Dashboard (T009-T012)
4. **STOP and VALIDATE**: Pie chart displays with sample data
5. Complete Phase 4: Contributors (T013-T017)
6. Complete Phase 5: Log Contributions (T018-T021)
7. **STOP and VALIDATE**: Core equity tracking functional

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Dashboard) → Visual feedback (MVP!)
3. US2 (Contributors) → Can add team members
4. US3 (Contributions) → Can log contributions
5. US4 (History) → Full audit trail
6. US5 (Export) → Data portability
7. US6 (Onboarding) → Polished UX

---

## Notes

- All tasks use existing template components (Button, Card, Modal, Table, Form)
- PieChart and ExportPanel are already available from template
- useEntities hook handles CRUD; useSlicingPie adds equity calculations
- No external APIs - all data in localStorage
- Commit after each completed task or logical group
