# Tasks: Edit Contributions

**Input**: Design documents from `/specs/002-edit-contributions/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not requested - skipping test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed - extending existing project

*No tasks required - project structure already exists*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core context methods that MUST be complete before user stories can be implemented

- [X] T001 Add updateContribution method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T002 Add removeContribution method to SlicingPieContext in src/context/SlicingPieContext.tsx
- [X] T003 Add getContributionById helper method to SlicingPieContext in src/context/SlicingPieContext.tsx

**Checkpoint**: Context methods ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Edit Contribution Details (Priority: P1) MVP

**Goal**: Users can click edit on any contribution, modify values in a form, save changes, and see updated slice calculations

**Independent Test**: Click edit on a contribution row, change the value, save, verify the contribution updates and slices recalculate

### Implementation for User Story 1

- [X] T004 [US1] Add optional contribution prop to ContributionForm interface in src/components/slicing-pie/ContributionForm.tsx
- [X] T005 [US1] Add useEffect to pre-populate form when contribution prop is provided in src/components/slicing-pie/ContributionForm.tsx
- [X] T006 [US1] Show contributor name as read-only text instead of dropdown when editing in src/components/slicing-pie/ContributionForm.tsx
- [X] T007 [US1] Change submit button text to "Save Changes" when in edit mode in src/components/slicing-pie/ContributionForm.tsx
- [X] T008 [US1] Update onSubmit handler to call updateContribution when editing in src/components/slicing-pie/ContributionForm.tsx
- [X] T009 [P] [US1] Add onEdit callback prop to ContributionRow in src/components/slicing-pie/ContributionRow.tsx
- [X] T010 [P] [US1] Add edit icon button to ContributionRow that calls onEdit in src/components/slicing-pie/ContributionRow.tsx
- [X] T011 [US1] Add editingContribution state to contributions page in src/app/contributions/page.tsx
- [X] T012 [US1] Add handleEdit function that fetches contribution and opens form in src/app/contributions/page.tsx
- [X] T013 [US1] Pass contribution prop to ContributionForm when editing in src/app/contributions/page.tsx
- [X] T014 [US1] Update handleFormSubmit to handle both add and update cases in src/app/contributions/page.tsx

**Checkpoint**: Edit functionality complete - users can modify existing contributions

---

## Phase 4: User Story 2 - Delete Contribution (Priority: P2)

**Goal**: Users can click delete on any contribution, see a confirmation dialog, and remove the contribution

**Independent Test**: Click delete on a contribution row, confirm deletion, verify the contribution is removed and totals update

### Implementation for User Story 2

- [X] T015 [P] [US2] Add onDelete callback prop to ContributionRow in src/components/slicing-pie/ContributionRow.tsx
- [X] T016 [P] [US2] Add delete icon button to ContributionRow that calls onDelete in src/components/slicing-pie/ContributionRow.tsx
- [X] T017 [US2] Add deleteConfirmId state to contributions page in src/app/contributions/page.tsx
- [X] T018 [US2] Add handleDelete function that sets deleteConfirmId in src/app/contributions/page.tsx
- [X] T019 [US2] Add confirmDelete function that calls removeContribution in src/app/contributions/page.tsx
- [X] T020 [US2] Add delete confirmation Modal to contributions page in src/app/contributions/page.tsx
- [X] T021 [US2] Wire up ContributionRow onDelete prop in contributions page in src/app/contributions/page.tsx

**Checkpoint**: Delete functionality complete - users can remove contributions with confirmation

---

## Phase 5: Polish & Verification

**Purpose**: Final verification and cleanup

- [X] T022 Run npm run build to verify no TypeScript errors
- [ ] T023 Manual test: Edit a time contribution and verify slices recalculate correctly
- [ ] T024 Manual test: Edit contribution type from time to cash and verify multiplier changes
- [ ] T025 Manual test: Delete a contribution and verify totals update
- [ ] T026 Manual test: Verify edit/delete work on mobile viewport

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: N/A - no tasks
- **Phase 2 (Foundational)**: No dependencies - start immediately
- **Phase 3 (US1 - Edit)**: Depends on Phase 2 (T001-T003)
- **Phase 4 (US2 - Delete)**: Depends on Phase 2 (T002 specifically)
- **Phase 5 (Polish)**: Depends on Phase 3 and Phase 4

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001, T003 from Foundational
- **User Story 2 (P2)**: Depends on T002 from Foundational
- US1 and US2 can run in parallel after Foundational is complete

### Parallel Opportunities

**Within Phase 2:**
- T001, T002, T003 can be done together (same file, but independent methods)

**Within Phase 3 (US1):**
- T009, T010 can run in parallel with T004-T008 (different files)

**Within Phase 4 (US2):**
- T015, T016 can run in parallel with T017-T021 (different files)

**Across User Stories:**
- After Phase 2, US1 and US2 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch in parallel:

# ContributionForm updates (sequential within file):
Task: T004 - Add contribution prop to ContributionForm
Task: T005 - Pre-populate form when editing
Task: T006 - Show contributor as read-only
Task: T007 - Change button text for edit mode
Task: T008 - Update onSubmit for editing

# ContributionRow updates (can run parallel to above):
Task: T009 - Add onEdit callback prop
Task: T010 - Add edit icon button
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: User Story 1 (T004-T014)
3. **STOP and VALIDATE**: Test editing works correctly
4. Proceed to User Story 2 if time permits

### Full Feature Delivery

1. Complete Phase 2: Foundational
2. Complete Phase 3: User Story 1 (Edit)
3. Complete Phase 4: User Story 2 (Delete)
4. Complete Phase 5: Polish & Verification
5. Create PR for review

---

## Notes

- All changes are modifications to existing files - no new files needed
- Reuse existing Modal component pattern from ContributorsPage for delete confirmation
- ContributionForm already handles slice calculation - just need to pass existing data
- Contributor cannot be changed on edit (per FR-009) - show as read-only
