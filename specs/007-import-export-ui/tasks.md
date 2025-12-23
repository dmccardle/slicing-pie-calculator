# Tasks: Import/Export UI Improvements

**Input**: Design documents from `/specs/007-import-export-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in spec - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 0 | No setup needed (existing project) |
| Phase 2: Foundational | 2 | ImportConfirmModal component |
| Phase 3: User Stories 1+2 | 4 | Onboarding import with checkbox (P1) |
| Phase 4: User Story 3 | 1 | Download current data option (P2) |
| Phase 5: User Story 5 | 2 | Consistent confirmation all flows (P2) |
| Phase 6: User Story 4 | 1 | Sample data description (P3) |
| Phase 7: Polish | 1 | Validation |
| **Total** | **11** | |

---

## Phase 1: Setup

**Purpose**: No setup needed - existing Next.js project with all dependencies

*(No tasks - project infrastructure already exists)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared ImportConfirmModal component used by all import flows

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Complete ImportConfirmModal component with checkbox state and disabled button logic in src/components/slicing-pie/ImportConfirmModal.tsx
- [X] T002 Export ImportConfirmModal from src/components/slicing-pie/index.ts

**Checkpoint**: Foundation ready - ImportConfirmModal available for all user stories

---

## Phase 3: User Stories 1+2 - Import from Onboarding with Checkbox (Priority: P1) MVP

**Goal**: Add Import Data option to onboarding modal with required checkbox confirmation

**Independent Test**: Open app in fresh browser, verify Import Data is first button, clicking opens file picker, selecting valid file shows confirmation modal with disabled Import button until checkbox is checked

### Implementation for User Stories 1+2

- [X] T003 [US1] Add onImportData prop to OnboardingModal interface in src/components/slicing-pie/OnboardingModal.tsx
- [X] T004 [US1] Reorder buttons (Import Data first, Start Empty second, Sample Data third) and add import click handler in src/components/slicing-pie/OnboardingModal.tsx
- [X] T005 [US1] Add import state management and ImportConfirmModal integration to OnboardingModal in src/components/slicing-pie/OnboardingModal.tsx
- [X] T006 [US1] Wire up onboarding import handler in src/app/page.tsx to pass onImportData to OnboardingModal

**Checkpoint**: User Stories 1+2 complete - onboarding import with checkbox confirmation works

---

## Phase 4: User Story 3 - Download Current Data Before Import (Priority: P2)

**Goal**: Show "Download current data first" button in confirmation modal when user has existing data

**Independent Test**: With existing data, trigger import and verify download button appears; without data, verify button is hidden

### Implementation for User Story 3

- [X] T007 [US3] Add hasExistingData check and pass onExportCurrent callback to ImportConfirmModal in all import locations

**Checkpoint**: User Story 3 complete - download option appears for users with existing data

---

## Phase 5: User Story 5 - Consistent Confirmation Across All Flows (Priority: P2)

**Goal**: Ensure LocalStorageBanner and settings page use the same ImportConfirmModal

**Independent Test**: Trigger import from dashboard banner and settings page, verify same confirmation modal with checkbox appears

### Implementation for User Story 5

- [X] T008 [US5] Update LocalStorageBanner to use ImportConfirmModal instead of inline confirmation modal in src/components/slicing-pie/LocalStorageBanner.tsx
- [X] T009 [US5] Update settings page to use ImportConfirmModal for import confirmation in src/app/settings/page.tsx

**Checkpoint**: User Story 5 complete - all three import entry points use identical confirmation

---

## Phase 6: User Story 4 - Updated Sample Data Description (Priority: P3)

**Goal**: Update Sample Data button description to clarify its exploratory nature

**Independent Test**: Open onboarding modal, verify Sample Data shows "See the platform in action (can reset when ready)"

### Implementation for User Story 4

- [X] T010 [US4] Update Sample Data button text/description in src/components/slicing-pie/OnboardingModal.tsx

**Checkpoint**: User Story 4 complete - Sample Data description is clear

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T011 Run quickstart.md validation - test all scenarios listed in Testing section

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 2: Foundational (T001-T002)
    ↓
    ├── Phase 3: US1+US2 (T003-T006) MVP
    │       ↓
    ├── Phase 4: US3 (T007)
    │       ↓
    ├── Phase 5: US5 (T008-T009)
    │       ↓
    └── Phase 6: US4 (T010)
            ↓
        Phase 7: Polish (T011)
```

### User Story Dependencies

- **User Stories 1+2 (P1)**: Depends on Foundational - MVP scope
- **User Story 3 (P2)**: Can be added after US1+2 - enhances ImportConfirmModal
- **User Story 5 (P2)**: Can run parallel with US3 - updates other import locations
- **User Story 4 (P3)**: Independent - simple text change in OnboardingModal

### Within Each Phase

- T003 before T004 (props before implementation)
- T004 before T005 (button order before state management)
- T005 before T006 (component before page integration)

### Parallel Opportunities

- T008 and T009 can run in parallel (different files)
- US3, US5, US4 could theoretically run in parallel after US1+2 MVP

---

## Parallel Example: User Story 5

```bash
# Launch both tasks in parallel (different files):
T008: "Update LocalStorageBanner to use ImportConfirmModal"
T009: "Update settings page to use ImportConfirmModal"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 2: Foundational (T001-T002)
2. Complete Phase 3: User Stories 1+2 (T003-T006)
3. **STOP and VALIDATE**: Test onboarding import with checkbox
4. Merge if working - MVP delivered

### Incremental Delivery

1. Foundational → ImportConfirmModal ready
2. Add US1+2 → Test → **MVP Complete**
3. Add US3 → Test download option
4. Add US5 → Test all import flows consistent
5. Add US4 → Test sample data description
6. Polish → Final validation

### Single Developer Strategy (Recommended)

Given all changes are UI components:

1. Complete all tasks sequentially
2. Test after each user story checkpoint
3. Single PR with all changes

---

## File Summary

| File | Tasks | Changes |
|------|-------|---------|
| `src/components/slicing-pie/ImportConfirmModal.tsx` | T001 | Complete component |
| `src/components/slicing-pie/index.ts` | T002 | Export component |
| `src/components/slicing-pie/OnboardingModal.tsx` | T003-T005, T010 | Add import, reorder, description |
| `src/app/page.tsx` | T006 | Wire up onboarding import |
| `src/components/slicing-pie/LocalStorageBanner.tsx` | T008 | Use ImportConfirmModal |
| `src/app/settings/page.tsx` | T009 | Use ImportConfirmModal |

---

## Notes

- No new dependencies required - using existing Modal, Button, useExport
- ImportConfirmModal is the key reusable component (Constitution Principle II)
- All changes are client-side React components (Constitution Principle I)
- Responsive design inherited from existing Modal component (Constitution Principle III)
