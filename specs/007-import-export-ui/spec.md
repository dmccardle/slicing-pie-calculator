# Feature Specification: Import/Export UI Improvements

**Feature Branch**: `007-import-export-ui`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: "Import/Export UI Improvements: Add Import Data button as first option in onboarding modal, reorder buttons, update Sample Data description, add confirmation checkbox to all import flows, add Download current data first button"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Data from Onboarding (Priority: P1)

A returning user visits the app on a new device/browser and wants to import their previously exported data. They should see an Import Data option prominently in the onboarding modal.

**Why this priority**: This is the primary use case - users who have existing data need to restore it quickly. Making import the first option reduces friction for returning users.

**Independent Test**: Open app in a fresh browser (no localStorage). Verify onboarding modal shows Import Data as the first button option, clicking it opens a file picker, and selecting a valid JSON file proceeds to import confirmation.

**Acceptance Scenarios**:

1. **Given** a user opens the app with no existing data, **When** the onboarding modal appears, **Then** Import Data is displayed as the first option (before Start Empty and Sample Data)
2. **Given** a user clicks Import Data in onboarding, **When** the file picker opens, **Then** they can select a valid Slicing Pie JSON export file
3. **Given** a user selects a valid export file, **When** the file is validated, **Then** a confirmation modal appears before importing

---

### User Story 2 - Confirm Import with Safety Checkbox (Priority: P1)

A user importing data needs to explicitly confirm they understand their current data will be replaced. This prevents accidental data loss.

**Why this priority**: Data protection is critical. Users must not accidentally overwrite their data without explicit acknowledgment.

**Independent Test**: Trigger any import flow (onboarding, dashboard, or settings). After selecting a file, verify the confirmation modal requires checking a checkbox before the Import button becomes enabled.

**Acceptance Scenarios**:

1. **Given** a user has selected a file to import, **When** the confirmation modal appears, **Then** the Import button is disabled by default
2. **Given** the confirmation modal is showing, **When** the user checks "I understand this will replace all current data", **Then** the Import button becomes enabled
3. **Given** the checkbox is checked, **When** the user unchecks it, **Then** the Import button becomes disabled again
4. **Given** the Import button is enabled, **When** the user clicks Import, **Then** the data is imported and the modal closes

---

### User Story 3 - Download Current Data Before Import (Priority: P2)

A user who has existing data wants to back it up before importing new data. The confirmation modal should offer a quick way to export current data first.

**Why this priority**: This is a safety feature for users who may not have backed up recently. Less critical than the checkbox but adds valuable protection.

**Independent Test**: With existing data in the app, trigger an import flow. Verify the confirmation modal shows a "Download current data first" button that exports the current data.

**Acceptance Scenarios**:

1. **Given** a user has existing data and triggers an import, **When** the confirmation modal appears, **Then** a "Download current data first" button is visible
2. **Given** a user has no existing data and triggers an import, **When** the confirmation modal appears, **Then** the "Download current data first" button is not shown
3. **Given** the download button is visible, **When** the user clicks it, **Then** their current data is exported as a JSON file
4. **Given** the user has downloaded their data, **When** they proceed with import, **Then** the import completes normally

---

### User Story 4 - Updated Sample Data Description (Priority: P3)

Users should understand that Sample Data is for exploration and can be reset. The description should clearly communicate this.

**Why this priority**: Improves clarity but doesn't affect functionality. Users benefit from understanding sample data is temporary/exploratory.

**Independent Test**: Open onboarding modal and verify Sample Data option includes description "See the platform in action (can reset when ready)".

**Acceptance Scenarios**:

1. **Given** a user views the onboarding modal, **When** they see the Sample Data option, **Then** it includes the description "See the platform in action (can reset when ready)"

---

### User Story 5 - Consistent Import Confirmation Across All Flows (Priority: P2)

The import confirmation experience (checkbox + download option) should be consistent whether importing from onboarding, dashboard banner, or settings page.

**Why this priority**: Consistency reduces user confusion and ensures safety measures apply everywhere.

**Independent Test**: Test import from all three locations (onboarding modal, LocalStorageBanner on dashboard, settings page) and verify the same confirmation modal with checkbox appears in each case.

**Acceptance Scenarios**:

1. **Given** a user imports from the onboarding modal, **When** confirmation appears, **Then** it includes the checkbox and download option
2. **Given** a user imports from the dashboard banner, **When** confirmation appears, **Then** it includes the same checkbox and download option
3. **Given** a user imports from settings, **When** confirmation appears, **Then** it includes the same checkbox and download option

---

### Edge Cases

- What happens when the user selects an invalid file format? Error message is shown, user can try again
- What happens when the selected file has corrupted data? Validation fails with helpful error message
- What happens if the download fails before import? User can retry download or proceed without backup
- What happens if the user closes the confirmation modal? No data is imported, original data preserved

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display Import Data as the first option in the onboarding modal
- **FR-002**: System MUST display onboarding options in this order: Import Data, Start Empty, Sample Data
- **FR-003**: System MUST show description "See the platform in action (can reset when ready)" for the Sample Data option
- **FR-004**: System MUST display a confirmation modal when a user selects a file to import
- **FR-005**: System MUST disable the Import button in the confirmation modal until the confirmation checkbox is checked
- **FR-006**: System MUST show a "Download current data first" button in the confirmation modal only when the user has existing data
- **FR-007**: System MUST use the same confirmation modal component for all import flows (onboarding, dashboard, settings)
- **FR-008**: System MUST export current data as JSON when user clicks "Download current data first"
- **FR-009**: System MUST preserve all existing data if user cancels the import confirmation

### Key Entities

- **Import Confirmation State**: Tracks whether checkbox is checked, whether download button should show
- **Import Data**: The validated JSON structure containing company, contributors, and contributions
- **Existing Data**: The user's current company, contributors, and contributions (determines if download button appears)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can import data from the onboarding modal within 3 clicks (Import Data -> Select File -> Confirm)
- **SC-002**: 100% of import flows require explicit checkbox confirmation before import executes
- **SC-003**: Users with existing data see the download option in all import confirmation scenarios
- **SC-004**: All three import entry points (onboarding, dashboard, settings) provide identical confirmation experience
- **SC-005**: Users cannot accidentally import data - the Import button is always disabled until checkbox is checked

## Assumptions

- Users understand "Import Data" means restoring from a previous export
- The existing validation logic for import files is sufficient
- The confirmation checkbox text "I understand this will replace all current data" is clear enough without additional explanation
- The onboarding modal has space for a third button option
