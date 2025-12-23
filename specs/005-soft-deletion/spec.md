# Feature Specification: Soft Deletion

**Feature Branch**: `005-soft-deletion`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Add soft deletion for contributors and contributions with activity history tracking and restoration capability"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Contributor with Cascade (Priority: P1)

A founder needs to remove a contributor who has left the company. When they delete the contributor, all of that person's contributions should also be marked as deleted so they no longer count toward equity calculations. However, the data should be preserved for audit purposes.

**Why this priority**: This is the core soft deletion behavior - without it, the feature has no value. Deleting contributors is a common operation that currently hard-deletes data permanently.

**Independent Test**: Can be fully tested by adding a contributor with contributions, deleting them, and verifying that: (1) they no longer appear in active lists, (2) their slices no longer count toward totals, (3) the data still exists in storage.

**Acceptance Scenarios**:

1. **Given** a contributor "Alice" with 3 contributions totaling 1000 slices, **When** the founder clicks "Delete" on Alice, **Then** Alice and her contributions are marked as deleted (not removed from storage), and total slices decrease by 1000.

2. **Given** a contributor with contributions, **When** they are soft-deleted, **Then** they no longer appear in the Contributors list, equity calculations, or pie charts.

3. **Given** multiple contributors where one is deleted, **When** viewing the dashboard, **Then** equity percentages recalculate to exclude the deleted contributor's slices.

---

### User Story 2 - Delete Individual Contribution (Priority: P2)

A contributor logged a contribution by mistake (wrong value, wrong type, or duplicate entry). The founder needs to delete just that one contribution without affecting the contributor or their other contributions.

**Why this priority**: Deleting individual contributions is more granular than deleting contributors and slightly less common, but still essential for data correction.

**Independent Test**: Can be tested by creating a contribution, deleting it, and verifying it no longer appears in the contribution list or affects slice totals.

**Acceptance Scenarios**:

1. **Given** a contribution of 500 slices, **When** the founder deletes it, **Then** the contribution is marked as deleted and 500 slices are subtracted from the contributor's total.

2. **Given** a deleted contribution, **When** viewing the Contributions list, **Then** the deleted contribution does not appear in the default view.

---

### User Story 3 - View Deleted Items (Priority: P3)

The founder wants to review what has been deleted to audit the equity history or prepare for restoration. They need a dedicated view showing all soft-deleted contributors and contributions.

**Why this priority**: Viewing deleted items is necessary for audit and restoration but is accessed less frequently than deletion itself.

**Independent Test**: Can be tested by deleting items, navigating to the trash view, and verifying all deleted items appear with their deletion timestamps.

**Acceptance Scenarios**:

1. **Given** multiple deleted contributors and contributions, **When** the founder opens the "Deleted Items" view, **Then** they see a list of all soft-deleted items organized by type (contributors, contributions).

2. **Given** a deleted item, **When** viewing it in the trash, **Then** the deletion timestamp is displayed.

3. **Given** no deleted items, **When** opening the trash view, **Then** a friendly empty state message is shown.

---

### User Story 4 - Restore Deleted Items (Priority: P4)

The founder accidentally deleted a contributor or contribution and needs to undo the deletion. They should be able to restore items from the trash view.

**Why this priority**: Restoration is a safety net feature - important but less frequently used than deletion.

**Independent Test**: Can be tested by deleting an item, opening trash, restoring it, and verifying it reappears in the active list with its original data intact.

**Acceptance Scenarios**:

1. **Given** a deleted contributor with 3 contributions, **When** the founder clicks "Restore", **Then** the contributor and all their contributions are restored and slices are added back to totals.

2. **Given** a deleted individual contribution (contributor still active), **When** restored, **Then** only that contribution is restored and slices are added back.

3. **Given** a restored contributor, **When** viewing the Contributors list, **Then** they appear exactly as before deletion with all their data intact.

---

### User Story 5 - View Deletion Activity (Priority: P5)

The founder wants to see a history of deletion and restoration events to track changes to the equity structure over time. This provides transparency for all stakeholders.

**Why this priority**: Activity history is valuable for audit and transparency but is an enhancement to core functionality.

**Independent Test**: Can be tested by performing deletions and restorations, then viewing the activity log to verify all events are recorded with timestamps.

**Acceptance Scenarios**:

1. **Given** a deletion event, **When** viewing the activity log, **Then** the event shows what was deleted, when, and the impact on slices.

2. **Given** a restoration event, **When** viewing the activity log, **Then** the event shows what was restored and when.

3. **Given** the dashboard, **When** recent deletions have occurred, **Then** the "Recent Activity" section reflects these changes.

---

### Edge Cases

- What happens when a contributor is restored but some of their contributions were individually deleted before the contributor was deleted? Only contributions that were cascade-deleted with the contributor are restored; individually deleted contributions remain deleted.
- What happens when trying to delete a contributor who is already deleted? No action taken - item is already in trash.
- What happens when all contributors are deleted? Dashboard shows empty state with total slices = 0.
- How does deletion affect vesting calculations? Deleted items are excluded from vesting projections.
- What happens to the activity log if it grows very large? Display most recent 50 events with option to load more.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST mark items as deleted using a `deletedAt` timestamp rather than removing them from storage
- **FR-002**: System MUST cascade soft-deletion from contributors to all their associated contributions
- **FR-003**: System MUST exclude soft-deleted items from all equity calculations (total slices, percentages, pie charts)
- **FR-004**: System MUST exclude soft-deleted items from default list views (Contributors, Contributions)
- **FR-005**: System MUST provide a "Deleted Items" view showing all soft-deleted contributors and contributions
- **FR-006**: System MUST allow restoration of soft-deleted items to their original state
- **FR-007**: System MUST restore cascade-deleted contributions when their parent contributor is restored
- **FR-008**: System MUST record deletion and restoration events for activity tracking
- **FR-009**: System MUST display deletion/restoration events in the Recent Activity section of the dashboard
- **FR-010**: System MUST allow permanent deletion from the trash view (hard delete)
- **FR-011**: System MUST exclude soft-deleted items from vesting projections and calculations

### Key Entities

- **SoftDeletable**: Extension to existing entities adding `deletedAt` (ISO timestamp) and `deletedWithParent` (contributor ID if cascade-deleted) fields
- **ActivityEvent**: Represents a deletion or restoration event with type (deleted/restored), entity type (contributor/contribution), entity identifier, entity name, timestamp, and slices affected
- **Contributor**: Existing entity extended with soft deletion capability
- **Contribution**: Existing entity extended with soft deletion capability

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can delete and restore items in under 3 seconds per action
- **SC-002**: Equity calculations update immediately (within 1 second) after deletion or restoration
- **SC-003**: 100% of deleted items can be found in the Deleted Items view
- **SC-004**: 100% of restored items return to their exact pre-deletion state
- **SC-005**: Activity log captures 100% of deletion and restoration events
- **SC-006**: Users can identify deleted items and their deletion dates at a glance in the trash view
- **SC-007**: Zero data loss - all soft-deleted items remain recoverable until permanently deleted

## Assumptions

- Single-user system: No need to track "who" deleted items (no user attribution)
- Deletion events stored in localStorage alongside existing data
- Activity log stored separately from entity data for clean separation
- Maximum practical limit of approximately 100 activity events stored (localStorage constraints)
- Restoration of a contributor also restores contributions that were deleted as part of the cascade, but not contributions that were individually deleted beforehand
