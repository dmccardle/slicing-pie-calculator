# Tasks: Soft Deletion

**Input**: Design documents from `/specs/005-soft-deletion/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: No setup required - project already exists with all dependencies

This phase is empty as we're extending an existing Next.js application.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and hook infrastructure that ALL user stories depend on

- [X] T001 Add SoftDeletable interface and ActivityEvent type in src/types/slicingPie.ts
- [X] T002 Extend Contributor interface with deletedAt field in src/types/slicingPie.ts
- [X] T003 Extend Contribution interface with deletedAt and deletedWithParent fields in src/types/slicingPie.ts
- [X] T004 Add softDelete method to useEntities hook in src/hooks/useEntities.ts
- [X] T005 Add restore method to useEntities hook in src/hooks/useEntities.ts
- [X] T006 Add getDeleted and getActive filter methods to useEntities hook in src/hooks/useEntities.ts
- [X] T007 Export updated hooks from src/hooks/index.ts

**Checkpoint**: Foundation ready - useEntities now supports soft delete operations

---

## Phase 3: User Story 1 - Delete Contributor with Cascade (Priority: P1)

**Goal**: When a contributor is deleted, mark them and all their contributions as soft-deleted. Equity calculations must exclude deleted items.

**Independent Test**: Delete a contributor with contributions, verify they disappear from lists and equity totals decrease accordingly.

### Implementation for User Story 1

- [X] T008 [US1] Update removeContributor in SlicingPieContext to use softDelete in src/context/SlicingPieContext.tsx
- [X] T009 [US1] Implement cascade deletion logic - soft-delete all contributions when contributor deleted in src/context/SlicingPieContext.tsx
- [X] T010 [US1] Filter deleted contributors from contributorsWithEquity computed value in src/context/SlicingPieContext.tsx
- [X] T011 [US1] Filter deleted contributions from contributions list in src/context/SlicingPieContext.tsx
- [X] T012 [US1] Update getTotalSlices to exclude deleted contributions in src/utils/slicingPie.ts
- [X] T013 [US1] Update calculateAllEquity to exclude deleted items in src/utils/slicingPie.ts
- [X] T014 [US1] Update getContributorTotalSlices to exclude deleted in src/utils/slicingPie.ts
- [X] T015 [US1] Update vesting calculations to exclude deleted items in src/utils/vesting.ts
- [X] T016 [US1] Update getVestedEquityData to filter deleted in src/utils/vesting.ts
- [X] T017 [US1] Update getVestingSummary to filter deleted in src/utils/vesting.ts

**Checkpoint**: Contributors can be soft-deleted with cascade to contributions. Equity recalculates correctly.

---

## Phase 4: User Story 2 - Delete Individual Contribution (Priority: P2)

**Goal**: Allow deleting a single contribution without affecting the contributor. The contribution is marked deleted and excluded from totals.

**Independent Test**: Delete one contribution, verify only that contribution disappears and slice totals decrease by its amount.

### Implementation for User Story 2

- [X] T018 [US2] Update removeContribution in SlicingPieContext to use softDelete in src/context/SlicingPieContext.tsx
- [X] T019 [US2] Ensure individual contribution deletion does NOT set deletedWithParent in src/context/SlicingPieContext.tsx
- [X] T020 [US2] Verify contributions page filters out deleted contributions in src/app/contributions/page.tsx

**Checkpoint**: Individual contributions can be soft-deleted independently. Both US1 and US2 work correctly.

---

## Phase 5: User Story 3 - View Deleted Items (Priority: P3)

**Goal**: Provide a "Deleted Items" page showing all soft-deleted contributors and contributions with deletion timestamps.

**Independent Test**: Delete items, navigate to /deleted, verify all deleted items appear with timestamps.

### Implementation for User Story 3

- [X] T021 [P] [US3] Create DeletedContributorCard component in src/components/slicing-pie/DeletedContributorCard.tsx
- [X] T022 [P] [US3] Create DeletedContributionRow component in src/components/slicing-pie/DeletedContributionRow.tsx
- [X] T023 [US3] Create DeletedItemsList component combining both in src/components/slicing-pie/DeletedItemsList.tsx
- [X] T024 [US3] Add getDeletedContributors method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T025 [US3] Add getDeletedContributions method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T026 [US3] Create /deleted page with DeletedItemsList in src/app/deleted/page.tsx
- [X] T027 [US3] Add "Deleted Items" navigation link to Sidebar in src/components/layout/Sidebar.tsx
- [X] T028 [US3] Export DeletedItemsList from src/components/slicing-pie/index.ts

**Checkpoint**: Users can view all deleted items in a dedicated trash view.

---

## Phase 6: User Story 4 - Restore Deleted Items (Priority: P4)

**Goal**: Allow restoring soft-deleted items from the trash view. Restoring a contributor also restores cascade-deleted contributions.

**Independent Test**: Delete a contributor, restore them from trash, verify they reappear with all cascade-deleted contributions.

### Implementation for User Story 4

- [X] T029 [P] [US4] Create RestoreButton component in src/components/slicing-pie/RestoreButton.tsx
- [X] T030 [US4] Add restoreContributor method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T031 [US4] Implement cascade restoration - restore contributions with matching deletedWithParent in src/context/SlicingPieContext.tsx
- [X] T032 [US4] Add restoreContribution method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T033 [US4] Integrate RestoreButton into DeletedContributorCard in src/components/slicing-pie/DeletedContributorCard.tsx
- [X] T034 [US4] Integrate RestoreButton into DeletedContributionRow in src/components/slicing-pie/DeletedContributionRow.tsx
- [X] T035 [US4] Export RestoreButton from src/components/slicing-pie/index.ts

**Checkpoint**: Users can restore deleted items. Cascade restoration works for contributors.

---

## Phase 7: User Story 5 - View Deletion Activity (Priority: P5)

**Goal**: Track and display deletion/restoration events in an activity log. Show recent activity on dashboard.

**Independent Test**: Perform deletions and restorations, verify events appear in activity log with timestamps and slice counts.

### Implementation for User Story 5

- [X] T036 [P] [US5] Create useActivityLog hook for activity event storage in src/hooks/useActivityLog.ts
- [X] T037 [P] [US5] Define ActivityEvent storage key and max events limit in src/hooks/useActivityLog.ts
- [X] T038 [US5] Create ActivityLog display component in src/components/slicing-pie/ActivityLog.tsx
- [X] T039 [US5] Integrate activity logging into soft delete operations in src/context/SlicingPieContext.tsx
- [X] T040 [US5] Integrate activity logging into restore operations in src/context/SlicingPieContext.tsx
- [X] T041 [US5] Add ActivityLog to /deleted page in src/app/deleted/page.tsx
- [X] T042 [US5] Update EquitySummary to show deletion events in Recent Activity in src/components/slicing-pie/EquitySummary.tsx
- [X] T043 [US5] Export useActivityLog from src/hooks/index.ts
- [X] T044 [US5] Export ActivityLog from src/components/slicing-pie/index.ts

**Checkpoint**: All deletion and restoration events are tracked and visible in activity log.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T045 [P] Add permanent delete (hard delete) option to DeletedItemsList in src/components/slicing-pie/DeletedItemsList.tsx
- [ ] T046 [P] Add confirmation modal for permanent deletion in src/app/deleted/page.tsx
- [ ] T047 Update data export to optionally include/exclude deleted items in src/utils/exporters.ts
- [X] T048 Add empty state for trash view when no deleted items in src/app/deleted/page.tsx
- [X] T049 Run npm run build and fix any TypeScript errors
- [X] T050 Run npm run lint and fix any linting issues
- [ ] T051 Manual testing per quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Empty - project exists
- **Phase 2 (Foundational)**: No dependencies - can start immediately. BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion (can run parallel to US1)
- **Phase 5 (US3)**: Depends on Phase 2 completion (can run parallel to US1/US2)
- **Phase 6 (US4)**: Depends on US3 (needs DeletedItemsList components)
- **Phase 7 (US5)**: Depends on US1, US2, US4 (needs delete/restore operations to log)
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 | Phase 2 | US2, US3 |
| US2 | Phase 2 | US1, US3 |
| US3 | Phase 2 | US1, US2 |
| US4 | US3 | - |
| US5 | US1, US2, US4 | - |

### Parallel Opportunities

**Within Phase 2**:
- T001-T003 (types) can run in parallel with T004-T006 (hooks) after T001 completes

**Within US1**:
- T012-T014 (slicingPie utils) can run parallel to T015-T017 (vesting utils)

**Within US3**:
- T021 and T022 can run in parallel (different components)

**Within US5**:
- T036 and T037 can run in parallel (same file but different functions)

---

## Parallel Example: User Story 3

```bash
# Launch parallel component creation:
Task: "Create DeletedContributorCard component in src/components/slicing-pie/DeletedContributorCard.tsx"
Task: "Create DeletedContributionRow component in src/components/slicing-pie/DeletedContributionRow.tsx"

# Then sequential assembly:
Task: "Create DeletedItemsList component combining both"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational types and hooks
2. Complete Phase 3: US1 - Soft delete contributors with cascade
3. **STOP and VALIDATE**: Test contributor deletion works
4. Items are soft-deleted, equity recalculates

### Recommended Order

1. Phase 2: Foundational (T001-T007)
2. Phase 3: US1 - Core soft delete (T008-T017)
3. Phase 4: US2 - Individual contribution delete (T018-T020)
4. Phase 5: US3 - Trash view (T021-T028)
5. Phase 6: US4 - Restoration (T029-T035)
6. Phase 7: US5 - Activity log (T036-T044)
7. Phase 8: Polish (T045-T051)

---

## Notes

- All paths are relative to repository root
- [P] tasks can run in parallel (different files, no blocking dependencies)
- [USn] label maps task to specific user story
- Commit after each completed phase
- Run build check (T049) before final validation
