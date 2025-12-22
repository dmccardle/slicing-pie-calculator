# Tasks: Cliff and Vesting Projections

**Input**: Design documents from `/specs/003-cliff-vesting-projections/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration for vesting feature

- [X] T001 Add NEXT_PUBLIC_VESTING_ENABLED to .env.example with default false

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add VestingConfig interface to src/types/slicingPie.ts (startDate, cliffMonths, vestingMonths)
- [X] T003 Add VestingStatus interface to src/types/slicingPie.ts (state, percentVested, vestedSlices, etc.)
- [X] T004 Add VestingState type to src/types/slicingPie.ts ('none' | 'preCliff' | 'vesting' | 'fullyVested')
- [X] T005 Extend Contributor interface with optional vesting field in src/types/slicingPie.ts
- [X] T006 Create src/utils/vesting.ts with calculateVestingStatus function (date, contributor) => VestingStatus
- [X] T007 Add calculateMonthsDifference utility function to src/utils/vesting.ts
- [X] T008 Add getCliffDate and getFullVestDate helper functions to src/utils/vesting.ts
- [X] T009 Create src/hooks/useFeatureFlags.ts with vestingEnabled flag and localStorage/env var support

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enable Vesting Mode (Priority: P1)

**Goal**: Allow users to toggle vesting features on/off via settings

**Independent Test**: Toggle vesting mode in settings and verify UI shows/hides vesting-related fields throughout the app

### Implementation for User Story 1

- [X] T010 [US1] Create FeatureFlagsContext in src/context/FeatureFlagsContext.tsx using useFeatureFlags hook
- [X] T011 [US1] Add FeatureFlagsProvider to src/app/layout.tsx (wrap children)
- [X] T012 [US1] Add "Vesting Features" toggle card to src/app/settings/page.tsx with vestingEnabled switch
- [X] T013 [US1] Export useFeatureFlagsContext hook from src/context/FeatureFlagsContext.tsx
- [X] T014 [US1] Add Projections nav link to src/components/layout/Sidebar.tsx (conditionally shown when vesting enabled)

**Checkpoint**: At this point, User Story 1 should be fully functional - settings toggle works and controls nav visibility

---

## Phase 4: User Story 2 - Configure Contributor Vesting (Priority: P2)

**Goal**: Allow users to set start date, cliff period, and vesting period for each contributor

**Independent Test**: Add/edit a contributor with vesting settings and verify the data persists correctly

### Implementation for User Story 2

- [X] T015 [US2] Add vesting fields section to src/components/slicing-pie/ContributorForm.tsx (conditionally shown)
- [X] T016 [US2] Add startDate date picker input to ContributorForm vesting section
- [X] T017 [US2] Add cliffMonths number input (0-24 range) to ContributorForm vesting section
- [X] T018 [US2] Add vestingMonths number input (12-60 range) to ContributorForm vesting section
- [X] T019 [US2] Update ContributorForm submit handler to include vesting data
- [X] T020 [US2] Create src/hooks/useVesting.ts hook that computes VestingStatus for a contributor
- [X] T021 [US2] Add vesting status display to src/components/slicing-pie/ContributorCard.tsx (pre-cliff/vesting/vested badge)
- [X] T022 [US2] Show months until cliff or vesting complete in ContributorCard when applicable

**Checkpoint**: At this point, contributors can have vesting configured and display their vesting status

---

## Phase 5: User Story 3 - View Current Equity with Vesting Status (Priority: P3)

**Goal**: Show current equity with vested vs unvested portions distinguished on dashboard

**Independent Test**: View dashboard with contributors at various vesting stages and verify vested/unvested breakdown is displayed

### Implementation for User Story 3

- [X] T023 [P] [US3] Create src/components/slicing-pie/VestingProgress.tsx component (progress bar with vested/unvested)
- [X] T024 [US3] Add VestingProgress component to ContributorCard for visual vesting indicator
- [X] T025 [US3] Add contributorsWithVesting computed value to src/context/SlicingPieContext.tsx
- [X] T026 [US3] Create getVestedEquityData utility in src/utils/vesting.ts for chart data with vested/unvested breakdown
- [X] T027 [US3] Update dashboard pie chart in src/app/page.tsx to show vested slices in solid color, unvested in lighter shade
- [X] T028 [US3] Add vesting legend to dashboard showing total vested vs unvested across all contributors

**Checkpoint**: Dashboard now shows vested/unvested breakdown visually for all contributors

---

## Phase 6: User Story 4 - Project Future Equity Distribution (Priority: P4)

**Goal**: Allow users to view projected equity at future dates via a Projections page

**Independent Test**: Select a future date on projections page and verify the pie chart updates to show projected vesting state

### Implementation for User Story 4

- [X] T029 [P] [US4] Create src/components/projections/DateSelector.tsx with date picker and preset buttons (6mo, 1yr, 2yr, 5yr)
- [X] T030 [P] [US4] Create src/components/projections/ProjectionChart.tsx using Recharts PieChart for projected equity
- [X] T031 [US4] Create src/app/projections/page.tsx with DateSelector and ProjectionChart components
- [X] T032 [US4] Add calculateProjectedVesting function to src/utils/vesting.ts (takes targetDate, returns projected status)
- [X] T033 [US4] Wire DateSelector to update ProjectionChart with recalculated projections on date change
- [X] T034 [US4] Add contributor list with projected vesting status on projections page
- [X] T035 [US4] Add summary stats to projections page (total vested, total unvested, next cliff date, next full vest date)

**Checkpoint**: Projections page is fully functional with date selection and projected equity visualization

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and cleanup

- [X] T036 Ensure all vesting UI is responsive across mobile, tablet, and desktop breakpoints
- [X] T037 Add aria-labels and accessibility attributes to vesting form fields and charts
- [X] T038 Verify backward compatibility: contributors without vesting show as 100% vested
- [X] T039 Test that vesting data is preserved when vesting mode is toggled off
- [X] T040 Run build and fix any TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Must complete first - provides feature flag infrastructure
  - US2 (P2): Depends on US1 (needs feature flag context)
  - US3 (P3): Depends on US2 (needs contributor vesting data)
  - US4 (P4): Depends on US2 (needs contributor vesting data)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 for feature flag context
- **User Story 3 (P3)**: Depends on US2 for vesting data - Can run parallel with US4
- **User Story 4 (P4)**: Depends on US2 for vesting data - Can run parallel with US3

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:
- T023 (VestingProgress) and T029/T030 (DateSelector/ProjectionChart) can be built in parallel
- US3 and US4 can be implemented in parallel after US2 completes

---

## Parallel Example: User Story 3 & 4 After US2

```bash
# After US2 completes, launch US3 and US4 in parallel:

# US3 - Dashboard visualization:
Task: "Create VestingProgress component in src/components/slicing-pie/VestingProgress.tsx"

# US4 - Projections page (parallel):
Task: "Create DateSelector in src/components/projections/DateSelector.tsx"
Task: "Create ProjectionChart in src/components/projections/ProjectionChart.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Settings toggle)
4. Complete Phase 4: User Story 2 (Contributor vesting config)
5. **STOP and VALIDATE**: Users can now configure vesting per contributor
6. Deploy/demo if ready

### Full Feature Delivery

1. Setup + Foundational
2. US1 (Settings toggle)
3. US2 (Contributor vesting data)
4. US3 + US4 in parallel (Dashboard viz + Projections page)
5. Polish
6. Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Contributors without vesting config MUST show as 100% vested (backward compatibility)
- Vesting calculations use linear (straight-line) vesting after cliff
- All dates use ISO format (YYYY-MM-DD)
- Commit after each task or logical group
