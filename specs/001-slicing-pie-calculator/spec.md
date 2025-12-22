# Feature Specification: Slicing Pie Equity Calculator

**Feature Branch**: `001-slicing-pie-calculator`
**Created**: 2025-12-22
**Status**: Draft
**Input**: Build a Slicing Pie equity calculator with company setup, contributors management, contribution logging with multipliers, equity dashboard, and export functionality

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Equity Dashboard (Priority: P1)

As a founder, I want to see the current equity split at a glance so I can understand how ownership is distributed among contributors.

**Why this priority**: The dashboard is the primary value proposition - it shows the real-time equity distribution that the Slicing Pie model calculates. Without this, there's no reason to use the app.

**Independent Test**: Can be tested by viewing the dashboard with sample data and verifying the pie chart displays contributor names, slice counts, and equity percentages accurately.

**Acceptance Scenarios**:

1. **Given** contributors exist with logged contributions, **When** I view the dashboard, **Then** I see a pie chart showing each contributor's equity percentage
2. **Given** no contributors exist, **When** I view the dashboard, **Then** I see an empty state prompting me to add contributors
3. **Given** contributions have been logged, **When** I hover over a pie slice, **Then** I see the contributor's name, total slices, and equity percentage

---

### User Story 2 - Manage Contributors (Priority: P2)

As a founder, I want to add, edit, and remove team members with their hourly rates so the system can calculate their time-based contributions correctly.

**Why this priority**: Contributors are the foundation of the equity calculation. Without contributors, you cannot log contributions or calculate equity.

**Independent Test**: Can be tested by adding a contributor, verifying they appear in the list with their hourly rate, editing their details, and removing them.

**Acceptance Scenarios**:

1. **Given** I am on the contributors page, **When** I add a new contributor with name and hourly rate, **Then** they appear in the contributors list
2. **Given** a contributor exists, **When** I edit their hourly rate, **Then** future time contributions use the new rate (existing contributions unchanged)
3. **Given** a contributor has logged contributions, **When** I remove them, **Then** I see a confirmation dialog warning that their contribution history will be preserved but they cannot add new contributions

---

### User Story 3 - Log Contributions (Priority: P3)

As a contributor, I want to log my contributions (time, cash, equipment, ideas, relationships) so they are tracked and count toward my equity.

**Why this priority**: Contribution logging is the core data entry mechanism. The system needs contributions to calculate equity.

**Independent Test**: Can be tested by selecting a contributor, choosing a contribution type, entering the value, and verifying the slice calculation matches Slicing Pie formulas.

**Acceptance Scenarios**:

1. **Given** I select a contributor and choose "Time" contribution, **When** I enter 10 hours, **Then** the system calculates slices as: hours x hourly rate x 2
2. **Given** I select "Cash" contribution, **When** I enter $1000, **Then** the system calculates slices as: amount x 4
3. **Given** I select "Non-cash" contribution, **When** I enter $500 fair market value, **Then** the system calculates slices as: value x 2
4. **Given** I select "Idea" or "Relationship" contribution, **When** I enter a value, **Then** the system uses a 1x multiplier (negotiated value equals slices)

---

### User Story 4 - View Contribution History (Priority: P4)

As a founder, I want to review all contributions over time with filtering and sorting so I can audit the equity calculations.

**Why this priority**: Transparency and auditability are essential for trust among co-founders. The history provides the audit trail.

**Independent Test**: Can be tested by viewing the history table, sorting by date/contributor/type, and filtering to specific contributors or types.

**Acceptance Scenarios**:

1. **Given** contributions exist, **When** I view the history page, **Then** I see a table with Date, Contributor, Type, Value, Slices, and Description columns
2. **Given** I click a column header, **When** sorting is applied, **Then** the table reorders by that column
3. **Given** I select a contributor filter, **When** the filter is applied, **Then** only that contributor's contributions are shown

---

### User Story 5 - Export and Backup Data (Priority: P5)

As a founder, I want to export my data to JSON, Excel, and PDF so I can share it with lawyers, investors, or back it up.

**Why this priority**: Data export is essential for legal documentation and data portability, but the core functionality must work first.

**Independent Test**: Can be tested by clicking each export button and verifying the downloaded file contains accurate data in the correct format.

**Acceptance Scenarios**:

1. **Given** data exists, **When** I click "Export JSON", **Then** a JSON file downloads containing all contributors and contributions
2. **Given** data exists, **When** I click "Export Excel", **Then** an Excel file downloads with sheets for Summary, Contributors, and Contributions
3. **Given** data exists, **When** I click "Export PDF", **Then** a PDF downloads showing the equity summary and pie chart
4. **Given** I have a JSON backup, **When** I click "Import JSON" and select the file, **Then** the data is restored

---

### User Story 6 - First-Time User Onboarding (Priority: P6)

As a new user, I want to see sample data so I can understand how the app works before entering my own data.

**Why this priority**: Onboarding improves user experience but is not essential for core functionality.

**Independent Test**: Can be tested by opening the app for the first time, loading sample data, exploring the features, then clearing the sample data.

**Acceptance Scenarios**:

1. **Given** the app has no data, **When** I first open it, **Then** I see an option to load sample data or start empty
2. **Given** I choose to load sample data, **When** the data loads, **Then** I see 3 sample contributors with various contribution types
3. **Given** sample data is loaded, **When** I click "Clear Sample Data", **Then** all data is removed and I can start fresh

---

### Edge Cases

- What happens when a contributor's hourly rate is $0? System allows time logging but slices calculate to 0.
- How does the system handle division when total slices is 0? Display "No contributions yet" instead of calculating percentages.
- What happens when importing a JSON file with invalid format? Display a user-friendly error message and reject the import.
- How are dates handled across timezones? All dates stored in ISO format, displayed in user's local timezone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a pie chart showing equity distribution by contributor
- **FR-002**: System MUST calculate equity percentage as: (Contributor's Slices / Total Slices) x 100
- **FR-003**: System MUST persist all data to browser storage automatically
- **FR-004**: Users MUST be able to add contributors with name and hourly rate
- **FR-005**: Users MUST be able to edit contributor details (name, email, hourly rate)
- **FR-006**: Users MUST be able to remove contributors (with confirmation)
- **FR-007**: System MUST apply Slicing Pie multipliers:
  - Time contributions: 2x (hours x hourly rate x 2)
  - Cash contributions: 4x
  - Non-cash contributions: 2x fair market value
  - Ideas/Relationships: 1x (negotiated value)
- **FR-008**: Users MUST be able to log contributions with: contributor, type, value, description, date
- **FR-009**: System MUST display contribution history with sorting and filtering
- **FR-010**: Users MUST be able to export data to JSON, Excel, and PDF formats
- **FR-011**: Users MUST be able to import data from JSON backup
- **FR-012**: System MUST offer sample data for first-time users
- **FR-013**: System MUST allow clearing all data

### Key Entities

- **Company**: Represents the startup being tracked. Attributes: name, description (optional)
- **Contributor**: A person who contributes to the startup. Attributes: identifier, name, email (optional), hourly rate, creation date
- **Contribution**: A single contribution made by a contributor. Attributes: identifier, contributor reference, type (time/cash/non-cash/idea/relationship), raw value, description, date, calculated multiplier, calculated slices

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a contributor and log their first contribution in under 2 minutes
- **SC-002**: Equity percentages update immediately (within 1 second) after any contribution is logged
- **SC-003**: Users can filter contribution history to a specific contributor in under 3 clicks
- **SC-004**: Export to all three formats (JSON, Excel, PDF) completes successfully without errors
- **SC-005**: Data persists across browser sessions without data loss
- **SC-006**: New users understand the app purpose within 30 seconds of loading sample data
- **SC-007**: The dashboard pie chart accurately reflects calculated equity to within 0.1% precision

## Assumptions

- Users understand the Slicing Pie equity model or will learn it through use
- Single-user application (no multi-user collaboration in MVP)
- Browser storage capacity is sufficient for typical startup data (100s of contributors/contributions)
- Users have modern browsers with JavaScript enabled
- Currency is assumed to be USD (no multi-currency support in MVP)
- All users are trusted (no access control between contributors in MVP)
