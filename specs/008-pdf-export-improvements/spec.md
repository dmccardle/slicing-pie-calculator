# Feature Specification: Improved PDF Export

**Feature Branch**: `008-pdf-export-improvements`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: "Improve PDF Export: 1) Show pie chart visualization in PDF, 2) Show summary table with contributor breakdown (name, slices, percentage), 3) Show contributions breakdown table with each contribution item, value, and total per person, 4) Populate PDF with company info (name, date), 5) Add toggle options: include valuation data (shows dollar values when enabled), show vesting/non-vested breakdown with vesting schedule and projections at certain points in time"

## User Scenarios & Testing

### User Story 1 - Basic PDF Export with Pie Chart and Summary (Priority: P1)

As a startup founder, I want to export a PDF report showing a visual pie chart of equity distribution along with a summary table of all contributors, so that I can share equity information with team members, investors, or legal advisors in a professional format.

**Why this priority**: This is the core value proposition - users need a visual, shareable document that represents their equity distribution. Without this, the PDF export is just raw data tables with no visual context.

**Independent Test**: Can be fully tested by adding contributors with contributions, then exporting a PDF and verifying it contains: company header, pie chart showing equity distribution, and summary table with contributor names, slice counts, and percentages.

**Acceptance Scenarios**:

1. **Given** a company with 3 contributors who have made contributions, **When** user clicks "Export PDF", **Then** the PDF contains a header with company name and export date, followed by a pie chart visualization showing each contributor's equity share with their name labels.

2. **Given** a company with contributors, **When** user exports PDF, **Then** the summary table shows each contributor's name, total slices, and percentage ownership, with a total row at the bottom.

3. **Given** a company with no contributions, **When** user attempts PDF export, **Then** the system displays a message indicating there is no data to export.

---

### User Story 2 - Detailed Contributions Breakdown (Priority: P2)

As a startup founder tracking contributions, I want the PDF to include a detailed breakdown of all individual contributions grouped by contributor, so that I have a complete audit trail of how equity was earned.

**Why this priority**: This provides the detailed record-keeping that makes the Slicing Pie model valuable for accountability and transparency. It builds on the summary by showing the "why" behind each person's equity share.

**Independent Test**: Can be tested by adding multiple contribution types (time, cash, non-cash) for multiple contributors, exporting PDF, and verifying each contribution appears with its type, description, value, and calculated slices.

**Acceptance Scenarios**:

1. **Given** a contributor with 5 contributions of various types, **When** user exports PDF with contributions breakdown enabled, **Then** the PDF shows a section for that contributor listing each contribution with date, type, description, value, and slices earned.

2. **Given** multiple contributors with contributions, **When** PDF is exported, **Then** contributions are grouped by contributor with a subtotal of slices for each person.

3. **Given** a contributor with no contributions, **When** PDF is exported, **Then** that contributor appears in the summary but has no entries in the contributions breakdown.

---

### User Story 3 - Valuation-Aware Export (Priority: P3)

As a startup founder who has set a company valuation, I want the PDF to optionally show dollar values alongside slice counts, so that team members can understand the monetary value of their equity stake.

**Why this priority**: Dollar values make abstract slice counts meaningful. This is conditional on the valuation feature being enabled and configured, making it a natural extension rather than core functionality.

**Independent Test**: Can be tested by setting a company valuation, toggling "Include valuation" on, exporting PDF, and verifying dollar values appear next to slice counts and percentages.

**Acceptance Scenarios**:

1. **Given** a company with valuation set to $1,000,000 and a contributor with 25% ownership, **When** user exports PDF with valuation toggle enabled, **Then** the PDF shows that contributor's equity value as $250,000 alongside their percentage.

2. **Given** a company with no valuation set, **When** user views export options, **Then** the "Include valuation" toggle is disabled/hidden with explanatory text.

3. **Given** valuation feature flag is disabled, **When** user views export options, **Then** the valuation toggle does not appear at all.

---

### User Story 4 - Vesting Schedule Export (Priority: P4)

As a startup founder with vesting schedules configured, I want the PDF to optionally show vested vs. unvested equity breakdown and future vesting projections, so that team members understand their vesting timeline.

**Why this priority**: Vesting adds complexity and is only relevant when the vesting feature is enabled. It provides forward-looking information that helps with planning but is not essential for basic equity reporting.

**Independent Test**: Can be tested by configuring vesting schedules for contributors, enabling "Show vesting breakdown" toggle, exporting PDF, and verifying vested/unvested columns appear with projection timeline.

**Acceptance Scenarios**:

1. **Given** a contributor with 1000 slices and 4-year vesting with 1-year cliff who is 18 months in, **When** PDF is exported with vesting toggle enabled, **Then** the PDF shows current vested slices, unvested slices, and cliff status.

2. **Given** vesting is enabled, **When** user exports PDF with vesting toggle on, **Then** a vesting projection table shows equity status at 6-month intervals for the next 2 years.

3. **Given** vesting feature flag is disabled, **When** user views export options, **Then** the vesting toggle does not appear at all.

4. **Given** a contributor with no vesting schedule configured, **When** PDF with vesting toggle is exported, **Then** that contributor shows as "100% vested" or "No vesting schedule".

---

### Edge Cases

- What happens when the pie chart has more than 10 contributors? Labels should remain readable, possibly using a legend instead of inline labels.
- How does the system handle very long contributor names or descriptions? Text should truncate with ellipsis to maintain table formatting.
- What happens when exporting with all toggles enabled and 50+ contributions? The PDF should handle pagination gracefully, keeping related sections together where possible.
- What if a contribution has no description? Display the contribution type as the description fallback.
- What if valuation or vesting toggles are enabled but the feature flags are off? Toggles should be hidden or disabled based on feature flag status.

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate a PDF document when user triggers export action
- **FR-002**: PDF MUST include a header section with company name and export date
- **FR-003**: PDF MUST include a pie chart visualization showing equity distribution by contributor
- **FR-004**: Pie chart MUST use distinct, accessible colors for each contributor segment
- **FR-005**: Pie chart MUST display contributor names and percentage labels
- **FR-006**: PDF MUST include a summary table with columns: Contributor Name, Total Slices, Percentage
- **FR-007**: Summary table MUST include a totals row showing aggregate slice count and 100% total
- **FR-008**: System MUST provide a toggle option to include detailed contributions breakdown
- **FR-009**: Contributions breakdown MUST group entries by contributor
- **FR-010**: Each contribution entry MUST show: date, type, description, value, slices earned
- **FR-011**: Each contributor section in breakdown MUST show a subtotal of slices
- **FR-012**: System MUST provide a toggle to include valuation data (visible only when valuation feature is active and configured)
- **FR-013**: When valuation is included, dollar values MUST appear alongside slice counts in summary table
- **FR-014**: System MUST provide a toggle to include vesting breakdown (visible only when vesting feature is active)
- **FR-015**: When vesting is included, summary table MUST show vested and unvested columns
- **FR-016**: When vesting is included, PDF MUST contain a vesting projection section showing future vesting at 6-month intervals
- **FR-017**: PDF MUST handle pagination, adding page breaks between major sections when content exceeds page length
- **FR-018**: Export MUST complete within 5 seconds for typical data sets (up to 20 contributors, 200 contributions)
- **FR-019**: System MUST display appropriate message when attempting to export with no data

### Key Entities

- **PDFExportOptions**: Configuration for PDF export including toggle states (includeContributionsBreakdown, includeValuation, includeVesting)
- **ContributorSummary**: Aggregated view of a contributor for the summary table (name, totalSlices, percentage, optionally dollarValue, vestedSlices, unvestedSlices)
- **ContributionDetail**: Individual contribution record for the breakdown table (date, type, description, value, slices, contributorId)
- **VestingProjection**: Future vesting status at a point in time (date, vestedPercentage, vestedSlices, unvestedSlices)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can generate a PDF report containing pie chart and summary table in under 5 seconds
- **SC-002**: Generated PDF is under 2MB for typical data sets (ensures reasonable file size for sharing)
- **SC-003**: Pie chart is readable with up to 10 contributors (distinct colors, legible labels)
- **SC-004**: 100% of contribution records appear accurately in the detailed breakdown when that option is selected
- **SC-005**: All monetary values, when displayed, are formatted consistently with the user's locale currency format
- **SC-006**: PDF renders correctly when opened in standard PDF readers (browser, Adobe Reader, Preview)
- **SC-007**: Export options respect feature flag states (valuation/vesting toggles only appear when features are enabled)

## Assumptions

- The existing chart rendering approach can be adapted to generate static images for PDF embedding
- Users have modern browsers that support PDF generation and download
- The pie chart will use the same color scheme as the in-app pie chart for consistency
- Currency formatting will match the existing application formatting
- Vesting projection intervals are fixed at 6 months (not configurable by user)
- The export will be triggered from the existing export location(s) in the application

## Out of Scope

- Customizable PDF templates or branding
- Email/sharing functionality directly from the export
- Password-protected PDFs
- PDF/A archival format compliance
- Export scheduling or automation
- Custom vesting projection intervals
