# Feature Specification: Company Valuation Configuration

**Feature Branch**: `004-company-valuation`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Add a Company Valuation configuration feature with manual and auto-calculated modes based on business metrics"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Valuation Mode (Priority: P1)

As a founder, I want to toggle the valuation feature on or off so that I can keep the app simple if I don't need dollar-value equity views.

**Why this priority**: The entire valuation feature should be optional. Users who prefer the simple Slicing Pie model without dollar valuations should not see any valuation-related UI.

**Independent Test**: Can be tested by toggling the setting and verifying that the Equity Values page and valuation configuration appear/disappear from navigation.

**Acceptance Scenarios**:

1. **Given** I am on the settings page, **When** I toggle "Enable Valuation" off, **Then** the Equity Values page is hidden from navigation and all valuation UI is removed
2. **Given** valuation is disabled, **When** I view any page in the app, **Then** I see no dollar values or valuation-related elements
3. **Given** valuation is enabled, **When** I view the navigation, **Then** I see an "Equity Values" menu item
4. **Given** the environment variable is set to disable valuation, **When** the app loads, **Then** the valuation toggle defaults to off

---

### User Story 2 - Manual Valuation Entry (Priority: P1)

As a founder, I want to manually enter my company's estimated valuation so that I can see contributor equity in dollar terms during discussions.

**Why this priority**: This is the simplest path to value - allows immediate use without requiring business metric data entry. Most early-stage startups have a rough valuation in mind from investor conversations or comparable companies.

**Independent Test**: Can be fully tested by entering a valuation amount and verifying the Equity Values page shows dollar values.

**Acceptance Scenarios**:

1. **Given** I am on the valuation configuration page, **When** I select "Manual" mode and enter a valuation amount (e.g., $500,000), **Then** the system saves this value and displays a confirmation
2. **Given** I have set a manual valuation, **When** I view the Equity Values page, **Then** I see dollar values calculated for each contributor
3. **Given** I have set a manual valuation, **When** I view the valuation settings, **Then** I see a prominent disclaimer stating this is not a legal valuation

---

### User Story 3 - Legal Disclaimer Display (Priority: P1)

As a founder, I need to see clear warnings that any valuation shown is NOT a legal or official valuation so that contributors understand this is for discussion purposes only.

**Why this priority**: Critical for legal protection - must be implemented alongside any valuation display to prevent misunderstandings about equity value.

**Independent Test**: Can be tested by verifying disclaimer text appears on all valuation-related screens and is clearly visible.

**Acceptance Scenarios**:

1. **Given** I am viewing the valuation configuration page, **When** the page loads, **Then** I see a prominent disclaimer stating "This is NOT an official legal valuation. It is a rough estimate for discussion purposes only."
2. **Given** I am viewing the Equity Values page, **When** dollar amounts are displayed, **Then** a visible note indicates these are estimates based on unofficial valuation
3. **Given** I am setting up valuation for the first time, **When** I attempt to save any valuation, **Then** I must acknowledge I understand this is not a legal valuation

---

### User Story 4 - Auto-Calculated Valuation (Priority: P2)

As a founder, I want to enter my business metrics and have the system calculate a rough valuation estimate so that I have a data-driven starting point for discussions.

**Why this priority**: More complex feature requiring multiple data inputs, but valuable for founders who want a methodical approach to estimating value.

**Independent Test**: Can be tested by entering business metrics and verifying a calculated valuation is displayed with the formula explanation.

**Acceptance Scenarios**:

1. **Given** I am on the valuation configuration page, **When** I select "Auto-calculate" mode, **Then** I see input fields for: current year net profit, historical net profit (up to 5 years), and customer churn rate
2. **Given** I have entered net profit data, **When** I save the configuration, **Then** the system calculates and displays a valuation range with explanation of the methodology
3. **Given** I have entered partial data (e.g., only current year profit), **When** I save, **Then** the system still calculates a valuation but indicates it's less accurate due to limited data

---

### User Story 5 - Equity Values Page (Priority: P2)

As a founder, I want a dedicated page showing each contributor's equity value in a sortable table so that I can easily compare and discuss equity stakes without cluttering the main dashboard.

**Why this priority**: Core value delivery for the feature - provides a clean, focused view of equity values separate from the main Slicing Pie workflow.

**Independent Test**: Can be tested by navigating to the Equity Values page and verifying the table displays correctly with all columns and sorting works.

**Acceptance Scenarios**:

1. **Given** valuation is enabled and set, **When** I navigate to the Equity Values page, **Then** I see a table with columns: Contributor Name, Number of Slices, Percentage, Total Value
2. **Given** I am viewing the Equity Values table, **When** I click on a column header, **Then** the table sorts by that column (ascending/descending toggle)
3. **Given** I am viewing the Equity Values table, **When** vesting is enabled for contributors, **Then** the table shows an additional "Vested Value" column
4. **Given** no valuation has been set, **When** I navigate to the Equity Values page, **Then** I see a message prompting me to configure a valuation first
5. **Given** I am viewing the Equity Values table, **When** there are many contributors, **Then** the table is scrollable and maintains header visibility

---

### User Story 6 - Valuation History Tracking (Priority: P4)

As a founder, I want to track how my valuation estimates change over time so that I can see the company's growth trajectory.

**Why this priority**: Nice-to-have feature that adds value over time. Lower priority as it doesn't affect core valuation functionality.

**Independent Test**: Can be tested by changing valuation multiple times and viewing a history log.

**Acceptance Scenarios**:

1. **Given** I have previously set valuations, **When** I view valuation settings, **Then** I see a history of past valuations with dates
2. **Given** I am viewing valuation history, **When** there are multiple entries, **Then** I can see the trend (increasing/decreasing) visually
3. **Given** I want to revert to a previous valuation, **When** I click on a historical entry, **Then** I can restore that valuation as the current one

---

### Edge Cases

- What happens when valuation is set to zero or negative? - System rejects with validation error
- What happens when no valuation is set? - Equity Values page shows prompt to configure valuation
- How does the system handle very large valuations (e.g., billions)? - Use appropriate number formatting (e.g., "$1.2B")
- What happens when auto-calculation inputs have missing years? - Calculate with available data, show confidence indicator
- What happens when churn rate exceeds 100%? - Reject with validation error (churn must be 0-100%)
- How are negative profits handled? - Allow negative values; adjust valuation formula to account for losses
- What happens when valuation is disabled after being configured? - Configuration is preserved but UI is hidden; re-enabling restores previous state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a settings toggle to enable/disable the entire valuation feature
- **FR-002**: System MUST support environment variable to set default valuation enabled state
- **FR-003**: System MUST hide all valuation UI (page, navigation, dollar values) when feature is disabled
- **FR-004**: System MUST provide two valuation modes: "Manual" (user enters value) and "Auto-Calculate" (system computes from metrics)
- **FR-005**: System MUST display a legal disclaimer on all valuation-related screens stating this is NOT an official valuation
- **FR-006**: System MUST require user acknowledgment of the disclaimer before saving the first valuation
- **FR-007**: System MUST validate valuation inputs: positive numbers only for manual mode, 0-100% for churn rate
- **FR-008**: System MUST persist valuation configuration locally (consistent with app's local-first architecture)
- **FR-009**: System MUST calculate valuation using a transparent formula when in auto-calculate mode
- **FR-010**: System MUST allow users to enter net profit for current year
- **FR-011**: System MUST allow users to optionally enter net profit for up to 5 previous years
- **FR-012**: System MUST allow users to enter customer churn rate as a percentage
- **FR-013**: System MUST provide a dedicated Equity Values page with sortable table
- **FR-014**: Equity Values table MUST include columns: Contributor Name, Number of Slices, Percentage, Total Value
- **FR-015**: Equity Values table MUST support sorting by any column (ascending/descending)
- **FR-016**: System MUST format large numbers appropriately (e.g., $1.2M, $500K)
- **FR-017**: System MUST maintain a history of valuation changes with timestamps
- **FR-018**: System MUST NOT display dollar values on existing dashboard or contributor pages (keep valuation isolated to dedicated page)

### Key Entities

- **ValuationConfig**: The main configuration entity storing mode (manual/auto), manual value, business metrics, calculated value, and enabled state
- **BusinessMetrics**: Sub-entity containing net profit history (array of year/value pairs), current year profit, and churn rate
- **ValuationHistory**: Collection of past valuation snapshots with timestamps for trend tracking
- **EquityValueRow**: Computed entity for table display containing contributor reference, slices, percentage, and dollar value

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set a company valuation (manual or auto) in under 2 minutes
- **SC-002**: 100% of valuation displays include the legal disclaimer or linked reference to it
- **SC-003**: Users can access the Equity Values page in 1 click from main navigation
- **SC-004**: Equity Values table loads within 1 second for up to 100 contributors
- **SC-005**: Sorting the Equity Values table responds within 200ms
- **SC-006**: Disabling valuation feature completely removes all valuation UI from the app
- **SC-007**: Users report the feature helps facilitate equity discussions (qualitative feedback)

## Assumptions

- The app will use a standard SaaS valuation formula based on revenue multiples adjusted for growth and churn (industry-standard approach)
- Users are comfortable entering approximate business metrics rather than exact figures
- The feature follows the existing local-first architecture (localStorage)
- Dollar values will use USD as the default currency (can be extended later)
- The legal disclaimer language will be reviewed by the product owner before launch
- Valuation history is limited to the last 20 entries to manage storage
- The Equity Values page follows the same responsive design patterns as other pages

## Out of Scope

- Official/legal valuation services or integrations
- Multi-currency support (future enhancement)
- Automated data import from accounting software
- Comparison with industry benchmarks or comparable companies
- Tax implications or reporting
- Dollar values on main dashboard or contributor cards (intentionally isolated to dedicated page)
