# Feature Specification: Cliff and Vesting Projections

**Feature Branch**: `003-cliff-vesting-projections`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Add cliff and vesting functionality with future equity projections"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Vesting Mode (Priority: P1)

As a startup founder, I want to enable or disable vesting features via settings, so that I can choose between simple equity tracking or time-based vesting calculations.

**Why this priority**: Foundation for all vesting features - must be configurable first before any vesting data can be captured or displayed.

**Independent Test**: Toggle vesting mode in settings and verify UI shows/hides vesting-related fields throughout the app.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I toggle "Enable Vesting Features" on, **Then** vesting fields appear in contributor forms and projections tab becomes visible
2. **Given** vesting mode is enabled, **When** I toggle it off, **Then** vesting fields are hidden but existing vesting data is preserved
3. **Given** vesting mode is disabled by default, **When** I first visit the app, **Then** I see the simple equity view without vesting complexity

---

### User Story 2 - Configure Contributor Vesting (Priority: P2)

As a startup founder, I want to set start date, cliff period, and vesting period for each contributor, so that I can track when their equity becomes fully vested.

**Why this priority**: Core data entry capability - needed before projections can be calculated.

**Independent Test**: Add/edit a contributor with vesting settings and verify the data persists correctly.

**Acceptance Scenarios**:

1. **Given** vesting mode is enabled and I am adding a contributor, **When** I fill in start date, cliff months, and vesting months, **Then** the contributor is saved with vesting configuration
2. **Given** a contributor exists without vesting data, **When** I edit them and add vesting settings, **Then** the vesting data is saved
3. **Given** a contributor has a 12-month cliff and started 6 months ago, **When** I view their profile, **Then** I see they are "pre-cliff" with 6 months remaining
4. **Given** a contributor has passed their cliff, **When** I view their profile, **Then** I see their vesting progress percentage

---

### User Story 3 - View Current Equity with Vesting Status (Priority: P3)

As a startup founder, I want to see current equity distribution with vested vs unvested portions clearly distinguished, so that I understand actual vs projected ownership.

**Why this priority**: Provides immediate value by showing vesting status on existing dashboard views.

**Independent Test**: View dashboard with contributors at various vesting stages and verify vested/unvested breakdown is displayed.

**Acceptance Scenarios**:

1. **Given** contributors have vesting configured, **When** I view the dashboard pie chart, **Then** I see vested slices in solid color and unvested in a lighter/hatched pattern
2. **Given** a contributor is pre-cliff, **When** I view the contributor breakdown, **Then** their equity shows as 0% vested
3. **Given** a contributor is 50% through their vesting period (post-cliff), **When** I view their equity, **Then** I see 50% vested and 50% unvested

---

### User Story 4 - Project Future Equity Distribution (Priority: P4)

As a startup founder, I want to view projected equity at future dates, so that I can plan for when team members will be fully vested.

**Why this priority**: Advanced feature that builds on previous stories - provides strategic planning value.

**Independent Test**: Select a future date on projections page and verify the pie chart updates to show projected vesting state.

**Acceptance Scenarios**:

1. **Given** contributors have vesting configured, **When** I navigate to the Projections tab, **Then** I see a date selector defaulting to today
2. **Given** I am on projections, **When** I select a date 1 year in the future, **Then** the equity chart updates to show projected vested amounts
3. **Given** a contributor has a 4-year vesting schedule starting today, **When** I project 2 years ahead, **Then** they show as 50% vested
4. **Given** multiple contributors at different vesting stages, **When** I project to a date when all are fully vested, **Then** the chart shows all equity as vested

---

### Edge Cases

- What happens when a contributor leaves before cliff? Their unvested slices are forfeited (but this is tracked manually, not automated)
- What happens when vesting is disabled after contributors have vesting data? Data is preserved but not displayed
- What happens when projecting past a contributor's full vesting date? They show as 100% vested
- What happens when a contributor has no vesting settings? They are treated as immediately 100% vested (legacy behavior)
- What happens when start date is in the future? Vesting countdown begins from that future date

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a settings toggle to enable/disable vesting features
- **FR-002**: System MUST allow configuration via environment variable to set default vesting mode
- **FR-003**: Contributor form MUST include optional start date, cliff period (months), and vesting period (months) fields when vesting is enabled
- **FR-004**: System MUST calculate vesting progress based on time elapsed since start date, accounting for cliff
- **FR-005**: Dashboard MUST visually distinguish vested vs unvested equity when vesting mode is enabled
- **FR-006**: System MUST provide a Projections view/tab for viewing future equity states
- **FR-007**: Projections view MUST allow selecting any future date to see projected vesting status
- **FR-008**: System MUST provide preset date shortcuts (6 months, 1 year, 2 years, 5 years)
- **FR-009**: Contributors without vesting settings MUST be treated as 100% vested (backward compatible)
- **FR-010**: System MUST preserve vesting data when vesting mode is toggled off
- **FR-011**: Vesting calculations MUST use linear (straight-line) vesting after cliff

### Key Entities

- **VestingConfig**: Per-contributor vesting settings (startDate, cliffMonths, vestingMonths)
- **VestingStatus**: Computed state (preCliff, vesting, fullyVested) with percentage and dates
- **FeatureFlags**: App-level configuration including vestingEnabled flag
- **Projection**: Point-in-time equity calculation for a specific future date

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle vesting mode in under 10 seconds
- **SC-002**: Contributor vesting configuration can be completed in under 30 seconds
- **SC-003**: Projection view loads and updates within 1 second when changing dates
- **SC-004**: 100% of existing contributors without vesting data continue to display correctly (backward compatible)
- **SC-005**: Users can project equity for any date up to 10 years in the future
- **SC-006**: All vesting calculations match expected linear vesting formula within 0.1% accuracy

## Scope

### In Scope

- Settings toggle for vesting features
- Environment variable for default vesting mode
- Contributor vesting fields (start date, cliff, vesting period)
- Vesting progress calculation and display
- Dashboard vested/unvested visualization
- Projections tab with date selection
- Date preset shortcuts
- Linear vesting calculation

### Out of Scope

- Complex vesting schedules (graded, back-loaded, front-loaded)
- Vesting acceleration clauses
- Vesting schedule import/export
- Multiple vesting grants per contributor
- Tax implications or reporting
- Legal document generation
- Hypothetical/simulated contributors in projections (deferred to future iteration)

## Assumptions

- Linear (straight-line) vesting is sufficient for MVP
- Monthly granularity for cliff and vesting periods is acceptable
- Users understand basic vesting concepts (no in-app education needed)
- Vesting applies to all of a contributor's accumulated slices
- Environment variable takes precedence over localStorage setting for default state
