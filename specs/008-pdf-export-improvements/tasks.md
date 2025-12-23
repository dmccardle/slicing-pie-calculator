# Tasks: Improved PDF Export

**Input**: Design documents from `/specs/008-pdf-export-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pdf-export.md

**Tests**: Not explicitly requested - tests are NOT included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single web application (Next.js)
- **Source**: `src/` at repository root
- **Components**: `src/components/`
- **Hooks**: `src/hooks/`
- **Utils**: `src/utils/`
- **Types**: `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base type definitions

- [X] T001 Install html2canvas dependency via `npm install html2canvas`
- [X] T002 [P] Create PDF export types file in src/types/pdfExport.ts with PDFExportOptions, ContributorSummaryRow, ContributionDetailRow, ContributorContributionsSection, VestingProjectionRow, and PDFReportData interfaces
- [X] T003 [P] Export CHART_COLORS constant from src/components/charts/PieChart.tsx (rename DEFAULT_COLORS to exported CHART_COLORS)
- [X] T004 Re-export PDF types from src/types/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create pdfChartRenderer utility in src/utils/pdfChartRenderer.ts with renderChartToImage function using html2canvas
- [X] T006 Create pdfDataFormatter utility in src/utils/pdfDataFormatter.ts with formatPDFReportData, formatContributorSummary, formatContributionDetails functions
- [X] T007 Create enhanced exportEnhancedPDF function in src/utils/exporters.ts extending existing PDF export with chart image support and section-based layout

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Basic PDF Export with Pie Chart and Summary (Priority: P1)

**Goal**: Export a PDF with company header, pie chart visualization, and summary table showing contributor breakdown

**Independent Test**: Add contributors with contributions, export PDF, verify it contains company name, date, pie chart, and summary table with names/slices/percentages

### Implementation for User Story 1

- [X] T008 [US1] Create usePDFExport hook in src/hooks/usePDFExport.ts with status tracking, progress reporting, and exportPDF function for basic export (no options UI yet)
- [X] T009 [US1] Create hidden chart container component for PDF rendering in src/components/export/PDFChartContainer.tsx that renders PieChart off-screen for capture
- [X] T010 [US1] Implement PDF header section rendering (company name, "Equity Report" subtitle, date) in exportEnhancedPDF function in src/utils/exporters.ts
- [X] T011 [US1] Implement pie chart image embedding in PDF in exportEnhancedPDF function in src/utils/exporters.ts
- [X] T012 [US1] Implement summary table rendering with Name, Slices, Percentage columns and totals row in exportEnhancedPDF function in src/utils/exporters.ts
- [X] T013 [US1] Add PDF export button to LocalStorageBanner component in src/components/slicing-pie/LocalStorageBanner.tsx using usePDFExport hook
- [X] T014 [US1] Handle empty data case - show message when no contributions exist in usePDFExport hook

**Checkpoint**: Basic PDF export with pie chart and summary table works. Can be tested independently.

---

## Phase 4: User Story 2 - Detailed Contributions Breakdown (Priority: P2)

**Goal**: Add optional contributions breakdown section showing all contributions grouped by contributor

**Independent Test**: Enable contributions breakdown toggle, export PDF, verify each contributor has a section with their contributions and subtotals

### Implementation for User Story 2

- [X] T015 [US2] Create PDFExportOptions component in src/components/export/PDFExportOptions.tsx with toggle for includeContributionsBreakdown
- [X] T016 [US2] Add formatContributionDetails function to pdfDataFormatter in src/utils/pdfDataFormatter.ts to format individual contribution rows
- [X] T017 [US2] Implement contributions breakdown section rendering in exportEnhancedPDF in src/utils/exporters.ts with contributor headers, contribution tables, and subtotals
- [X] T018 [US2] Handle pagination for contributions breakdown (page breaks between contributors when needed) in src/utils/exporters.ts
- [X] T019 [US2] Integrate PDFExportOptions component into LocalStorageBanner in src/components/slicing-pie/LocalStorageBanner.tsx
- [X] T020 [US2] Update usePDFExport hook to accept PDFExportOptions parameter in src/hooks/usePDFExport.ts

**Checkpoint**: Contributions breakdown works. Toggle controls whether it appears in PDF.

---

## Phase 5: User Story 3 - Valuation-Aware Export (Priority: P3)

**Goal**: Add optional dollar values to summary table when company valuation is set

**Independent Test**: Set company valuation, enable valuation toggle, export PDF, verify dollar values appear in summary table

### Implementation for User Story 3

- [X] T021 [US3] Add includeValuation toggle to PDFExportOptions component in src/components/export/PDFExportOptions.tsx with disabled state when no valuation set
- [X] T022 [US3] Update formatContributorSummary in src/utils/pdfDataFormatter.ts to calculate and include dollarValue when valuation is provided
- [X] T023 [US3] Update summary table rendering in exportEnhancedPDF in src/utils/exporters.ts to include Value column when valuation is enabled
- [X] T024 [US3] Pass valuationConfig to usePDFExport hook and update hook signature in src/hooks/usePDFExport.ts
- [X] T025 [US3] Update LocalStorageBanner to pass valuation availability to PDFExportOptions in src/components/slicing-pie/LocalStorageBanner.tsx

**Checkpoint**: Valuation toggle works. Dollar values appear when enabled and valuation is set.

---

## Phase 6: User Story 4 - Vesting Schedule Export (Priority: P4)

**Goal**: Add optional vesting breakdown columns and projection table when vesting feature is enabled

**Independent Test**: Enable vesting feature, configure vesting for contributors, enable vesting toggle, export PDF, verify vested/unvested columns and projections appear

### Implementation for User Story 4

- [X] T026 [US4] Add includeVesting toggle to PDFExportOptions component in src/components/export/PDFExportOptions.tsx (only visible when vestingEnabled prop is true)
- [X] T027 [US4] Add calculateVestingProjections function to pdfDataFormatter in src/utils/pdfDataFormatter.ts to generate 6-month interval projections for 2 years
- [X] T028 [US4] Update formatContributorSummary in src/utils/pdfDataFormatter.ts to include vestedSlices, unvestedSlices, vestingStatus when vesting is enabled
- [X] T029 [US4] Update summary table rendering in exportEnhancedPDF in src/utils/exporters.ts to include Vested and Unvested columns when vesting is enabled
- [X] T030 [US4] Implement vesting projections table section in exportEnhancedPDF in src/utils/exporters.ts
- [X] T031 [US4] Update LocalStorageBanner to pass vestingEnabled (from feature flags) to PDFExportOptions in src/components/slicing-pie/LocalStorageBanner.tsx

**Checkpoint**: Vesting toggle works. Vested/unvested data and projections appear when enabled.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Refinements and edge case handling across all user stories

- [X] T032 Handle long contributor names with text truncation in PDF tables in src/utils/exporters.ts
- [X] T033 Handle 10+ contributors in pie chart by using legend instead of inline labels in src/components/export/PDFChartContainer.tsx
- [X] T034 Add progress feedback UI during PDF generation in LocalStorageBanner in src/components/slicing-pie/LocalStorageBanner.tsx
- [X] T035 Handle contribution with no description (fallback to contribution type) in formatContributionDetails in src/utils/pdfDataFormatter.ts
- [X] T036 Run build and fix any TypeScript errors via `npm run build`
- [X] T037 Run lint and fix any linting issues via `npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T004) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T005-T007)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (adds toggle to existing export)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (extends options component)
- **User Story 4 (Phase 6)**: Depends on User Story 3 (extends options component)
- **Polish (Phase 7)**: Can run after any user story is complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - MVP standalone
- **User Story 2 (P2)**: Depends on US1 (adds options to US1's export flow)
- **User Story 3 (P3)**: Depends on US2 (extends PDFExportOptions component)
- **User Story 4 (P4)**: Depends on US3 (extends PDFExportOptions component)

Note: US2-US4 have dependencies because they progressively build on the PDFExportOptions component. Each story can still be tested independently once implemented.

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002 [P] Create PDF export types
T003 [P] Export CHART_COLORS
```

**Within User Stories**: Most tasks are sequential due to file dependencies, but:
- T013 (add to LocalStorageBanner) can start once T008 (hook) is ready
- Polish tasks T032-T035 can run in parallel (different files/functions)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch in parallel after T001:
Task: "T002 - Create PDF export types file in src/types/pdfExport.ts"
Task: "T003 - Export CHART_COLORS from src/components/charts/PieChart.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: User Story 1 (T008-T014)
4. **STOP and VALIDATE**: Export PDF, verify chart and summary table
5. Deploy/demo if ready - basic PDF export is valuable alone

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test: Basic PDF with chart + summary → MVP!
3. Add User Story 2 → Test: Contributions breakdown appears
4. Add User Story 3 → Test: Dollar values appear when valuation set
5. Add User Story 4 → Test: Vesting data appears when feature enabled
6. Polish → Handle edge cases, improve UX

### Total Effort

- **Setup**: 4 tasks
- **Foundational**: 3 tasks
- **User Story 1**: 7 tasks
- **User Story 2**: 6 tasks
- **User Story 3**: 5 tasks
- **User Story 4**: 6 tasks
- **Polish**: 6 tasks

**Total**: 37 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label (US1-US4) maps task to specific user story
- Each user story checkpoint should produce testable functionality
- Commit after each task or logical group
- User stories 2-4 build on each other (PDFExportOptions component)
- Stop at MVP (US1) if timeline is tight - other stories add value incrementally
