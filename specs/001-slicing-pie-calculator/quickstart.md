# Quickstart: Slicing Pie Equity Calculator

**Date**: 2025-12-22

## Overview

This document describes key integration scenarios and user flows for testing the Slicing Pie Equity Calculator.

## Scenario 1: First-Time User Experience

**Goal**: New user loads sample data and explores the app

### Steps

1. User opens app for the first time
2. App detects no existing data (localStorage empty)
3. Onboarding modal appears with options:
   - "Load Sample Data" (primary action)
   - "Start Empty" (secondary action)
4. User clicks "Load Sample Data"
5. Sample data loads (3 contributors, 3 contributions)
6. Dashboard displays pie chart with equity distribution
7. User can explore Contributors and Contributions pages
8. User clicks "Clear Sample Data" in Settings when ready

### Expected State After

```
Contributors: 3 (Alice, Bob, Carol)
Contributions: 3
Total Slices: 37,000
Equity: Alice 32.4%, Bob 13.5%, Carol 54.1%
```

---

## Scenario 2: Add First Contributor and Contribution

**Goal**: User adds their first team member and logs work

### Steps

1. User navigates to Contributors page
2. Clicks "Add Contributor" button
3. Fills form:
   - Name: "John Smith"
   - Hourly Rate: $100
   - Email: (optional)
4. Clicks Save
5. Contributor appears in list with 0 slices, 0% equity
6. User navigates to Contributions page
7. Clicks "Add Contribution" button
8. Selects:
   - Contributor: John Smith
   - Type: Time
   - Hours: 10
   - Description: "Product research"
   - Date: Today
9. Preview shows: 10 hrs x $100/hr x 2 = 2,000 slices
10. Clicks Save
11. Contribution appears in history
12. Dashboard updates to show John with 100% equity

### Expected State After

```
Contributors: 1
Contributions: 1
Total Slices: 2,000
John's Equity: 100%
```

---

## Scenario 3: Multiple Contribution Types

**Goal**: User logs different contribution types

### Steps

1. Given: 2 contributors exist (Alice, Bob)
2. Log Time contribution for Alice:
   - 20 hours @ $150/hr = 20 * 150 * 2 = 6,000 slices
3. Log Cash contribution for Bob:
   - $2,000 = 2,000 * 4 = 8,000 slices
4. Log Non-cash contribution for Alice:
   - $1,000 laptop = 1,000 * 2 = 2,000 slices
5. Dashboard updates:
   - Total: 16,000 slices
   - Alice: 8,000 slices (50%)
   - Bob: 8,000 slices (50%)

### Expected State After

```
Total Slices: 16,000
Alice: 8,000 slices (50%)
Bob: 8,000 slices (50%)
```

---

## Scenario 4: Export and Import Data

**Goal**: User backs up data and restores it

### Steps

1. Given: App has contributors and contributions
2. User navigates to Settings
3. Clicks "Export JSON"
4. File downloads: `slicing-pie-backup-2024-12-22.json`
5. User clears all data
6. Dashboard shows empty state
7. User clicks "Import JSON"
8. Selects the backup file
9. Confirmation dialog appears
10. User confirms
11. Data restored, dashboard shows original pie chart

### Export File Structure

```json
{
  "company": {
    "name": "My Startup",
    "description": "Optional description"
  },
  "contributors": [...],
  "contributions": [...],
  "exportedAt": "2024-12-22T10:00:00Z"
}
```

---

## Scenario 5: Edit Contributor Rate

**Goal**: User updates hourly rate, existing contributions unchanged

### Steps

1. Given: Alice has 10 time contributions at $100/hr
2. User edits Alice's hourly rate to $150/hr
3. Existing contributions retain original slice values
4. User logs new 10-hour contribution for Alice
5. New contribution uses $150/hr: 10 * 150 * 2 = 3,000 slices

### Expected Behavior

- Past contributions: Unchanged (preserves historical accuracy)
- Future contributions: Use updated rate
- No automatic recalculation of historical data

---

## Scenario 6: Deactivate Contributor

**Goal**: Remove contributor without losing history

### Steps

1. Given: Bob has 5 contributions totaling 10,000 slices
2. User clicks "Remove" on Bob
3. Confirmation dialog:
   - "Remove Bob from active contributors?"
   - "Their 5 contributions (10,000 slices) will be preserved."
   - "They will retain their equity share."
4. User confirms
5. Bob marked as inactive
6. Bob's contributions remain in history
7. Bob's equity % unchanged
8. Bob no longer appears in "Add Contribution" dropdown

### Expected State After

- Bob's contributions: Preserved
- Bob's equity: Still displayed on pie chart
- Bob: Cannot receive new contributions

---

## Scenario 7: Filter Contribution History

**Goal**: User finds specific contributions

### Steps

1. Given: 20+ contributions across 5 contributors
2. User views Contributions page
3. Filters by contributor: "Alice"
4. Table shows only Alice's contributions
5. Footer shows: "Showing 8 of 20 contributions | Alice: 15,000 slices"
6. User adds date range filter: Last 30 days
7. Table narrows to recent contributions
8. User clicks column header to sort by Slices (descending)
9. User clears all filters

---

## Scenario 8: Edge Case - Zero Total Slices

**Goal**: Dashboard handles division by zero

### Steps

1. User adds contributor with $0 hourly rate
2. User logs 10 hours of time contribution
3. Slices calculated: 10 * 0 * 2 = 0 slices
4. Dashboard shows: "No contributions yet"
5. Pie chart hidden or shows empty state

### Expected Behavior

- No JavaScript errors
- Clear message to user
- Pie chart gracefully handles zero state

---

## Testing Checklist

| Scenario | P1 | P2 | P3 | P4 | P5 | P6 |
|----------|----|----|----|----|----|----|
| 1. First-time onboarding | Y | | | | | Y |
| 2. Add contributor + contribution | | Y | Y | | | |
| 3. Multiple contribution types | | | Y | | | |
| 4. Export/import data | | | | | Y | |
| 5. Edit contributor rate | | Y | | | | |
| 6. Deactivate contributor | | Y | | | | |
| 7. Filter contribution history | | | | Y | | |
| 8. Zero slices edge case | Y | | | | | |

P1-P6 refer to User Story priorities from the specification.
