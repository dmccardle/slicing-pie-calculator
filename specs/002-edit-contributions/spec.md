# Feature Specification: Edit Contributions

**Feature Branch**: `002-edit-contributions`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Add ability to edit contributions on the contributions page. Currently contributions are displayed in a table but there's no way to edit them. Users need to be able to modify contribution details after they've been logged."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Contribution Details (Priority: P1)

A user realizes they made an error when logging a contribution (wrong hours, incorrect amount, typo in description, or wrong date). They need to correct the mistake without deleting and re-entering the entire contribution.

**Why this priority**: This is the core feature request. Without the ability to edit, users must delete and recreate contributions to fix simple mistakes, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by clicking an edit action on any contribution row, modifying values, saving, and verifying the changes persist and slice calculations update correctly.

**Acceptance Scenarios**:

1. **Given** a contribution exists in the table, **When** user clicks the edit action, **Then** an edit form opens pre-populated with the contribution's current values
2. **Given** the edit form is open, **When** user modifies the value and saves, **Then** the contribution is updated and slices are recalculated
3. **Given** the edit form is open, **When** user changes the contribution type, **Then** the multiplier and slices update accordingly
4. **Given** the edit form is open, **When** user clicks cancel, **Then** no changes are saved and the form closes

---

### User Story 2 - Delete Contribution (Priority: P2)

A user logged a contribution by mistake (duplicate entry, wrong contributor, or contribution that shouldn't exist). They need to remove it entirely from the system.

**Why this priority**: Deletion is a common companion to editing. Users often need to remove erroneous entries, not just correct them.

**Independent Test**: Can be tested by clicking a delete action on a contribution, confirming the deletion, and verifying the contribution is removed and equity percentages recalculate.

**Acceptance Scenarios**:

1. **Given** a contribution exists in the table, **When** user clicks the delete action, **Then** a confirmation dialog appears
2. **Given** the confirmation dialog is shown, **When** user confirms deletion, **Then** the contribution is removed and totals update
3. **Given** the confirmation dialog is shown, **When** user cancels, **Then** the contribution remains unchanged

---

### Edge Cases

- What happens when editing a contribution for a contributor who has been deleted? System should still allow editing; display "Unknown" for missing contributor names
- What happens when user tries to set contribution value to zero or negative? Validation prevents saving with an error message
- What happens when user changes contribution type from "time" to "cash"? Slices recalculate using the appropriate multiplier for the new type

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display edit and delete actions for each contribution row in the table
- **FR-002**: System MUST open a modal/form pre-populated with contribution data when edit is clicked
- **FR-003**: System MUST allow modification of: contribution type, value, description, and date
- **FR-004**: System MUST recalculate slices when contribution type or value is changed
- **FR-005**: System MUST persist edited contributions to storage immediately upon save
- **FR-006**: System MUST show a confirmation dialog before deleting a contribution
- **FR-007**: System MUST update all equity percentage calculations after edit or delete
- **FR-008**: System MUST validate that contribution value is greater than zero
- **FR-009**: System MUST NOT allow changing the contributor on an existing contribution (prevents confusion; user should delete and recreate instead)

### Key Entities

- **Contribution**: The data being edited - includes id, contributorId, type, value, description, date, multiplier, slices
- **Contributor**: Referenced by contribution; hourly rate affects time contribution slice calculations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can edit any contribution field and save changes in under 30 seconds
- **SC-002**: All slice calculations update correctly within 1 second of saving an edit
- **SC-003**: Users receive clear feedback (success message or visual update) after saving changes
- **SC-004**: Zero data loss - edited contributions persist correctly across page refreshes
- **SC-005**: Delete confirmation prevents accidental deletions (requires explicit user confirmation)

## Assumptions

- The existing ContributionForm component can be reused for editing with minor modifications
- Users do not need to change which contributor a contribution belongs to (simplifies the feature)
- Edit history/audit trail is not required for this version
- Bulk editing of multiple contributions is out of scope
