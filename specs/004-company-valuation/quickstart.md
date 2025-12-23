# Quickstart: Company Valuation Configuration

**Feature**: 004-company-valuation
**Date**: 2025-12-22

## Testing Scenarios

### Scenario 1: Enable Valuation Feature

**Goal**: Verify feature flag controls visibility of valuation UI.

**Steps**:
1. Open the app with valuation disabled (default)
2. Navigate to Settings page
3. Locate "Enable Valuation" toggle
4. Toggle ON

**Expected**:
- "Equity Values" appears in sidebar navigation
- Valuation configuration section appears in Settings
- Toggle OFF hides all valuation UI

### Scenario 2: Set Manual Valuation (First Time)

**Goal**: Verify disclaimer acknowledgment flow and manual valuation entry.

**Steps**:
1. Enable valuation feature
2. Navigate to Settings > Valuation section
3. Ensure "Manual" mode is selected
4. Enter valuation: $500,000
5. Click "Save"
6. Observe disclaimer modal
7. Check acknowledgment checkbox
8. Click "Accept & Save"

**Expected**:
- Disclaimer modal appears with legal warning
- Save button disabled until checkbox checked
- After acceptance, valuation is saved
- Subsequent saves do not show disclaimer again

### Scenario 3: View Equity Values Page

**Goal**: Verify Equity Values table displays correctly.

**Prerequisites**:
- Valuation set to $500,000
- At least 3 contributors with slices

**Steps**:
1. Navigate to "Equity Values" page
2. Observe table columns
3. Click "Total Value" column header
4. Click again to reverse sort

**Expected**:
- Table shows: Name, Slices, Percentage, Total Value
- Disclaimer notice visible on page
- Sorting works (ascending/descending toggle)
- Values formatted correctly (e.g., "$125K")

### Scenario 4: Auto-Calculate Valuation

**Goal**: Verify auto-calculation with business metrics.

**Steps**:
1. Navigate to Settings > Valuation
2. Select "Auto-calculate" mode
3. Enter current year profit: $100,000
4. Add historical profits:
   - 2023: $80,000
   - 2022: $60,000
5. Enter churn rate: 10%
6. Click "Calculate"

**Expected**:
- Calculated valuation displayed (approximately $300K-400K range)
- Confidence indicator shows "High" (3 years data + churn)
- Formula explanation visible
- Save persists the calculated value

### Scenario 5: Partial Data Calculation

**Goal**: Verify confidence indicator with limited data.

**Steps**:
1. Select "Auto-calculate" mode
2. Enter only current year profit: $100,000
3. Leave history empty
4. Leave churn rate empty
5. Click "Calculate"

**Expected**:
- Calculation still works (approximately $300K with base multiple)
- Confidence indicator shows "Low"
- Message indicates more data improves accuracy

### Scenario 6: Valuation History

**Goal**: Verify history tracking and restore functionality.

**Steps**:
1. Set manual valuation to $500,000, save
2. Change to $750,000, save
3. Navigate to valuation history section
4. Click on $500,000 entry

**Expected**:
- History shows both entries with timestamps
- Clicking entry restores that valuation
- Current valuation updates to $500,000

### Scenario 7: Equity Values with Vesting

**Goal**: Verify vested value column when vesting is enabled.

**Prerequisites**:
- Both valuation and vesting features enabled
- Contributors have vesting configured

**Steps**:
1. Navigate to Equity Values page
2. Observe table columns

**Expected**:
- Additional "Vested Value" column appears
- Shows dollar value of vested portion only
- Can sort by vested value

### Scenario 8: Large Number Formatting

**Goal**: Verify number formatting for various scales.

**Steps**:
1. Set valuation to $1,500,000
2. View Equity Values page
3. Change valuation to $2,500,000,000
4. View Equity Values page again

**Expected**:
- $1.5M valuation shows contributor values with K/M suffixes
- $2.5B valuation shows values with M/B suffixes
- No truncation or overflow issues

### Scenario 9: Disable After Configuration

**Goal**: Verify UI hides but config persists.

**Steps**:
1. Configure valuation with data
2. Go to Settings
3. Toggle "Enable Valuation" OFF
4. Verify Equity Values page is hidden
5. Toggle ON again

**Expected**:
- All valuation UI disappears when disabled
- Previous configuration restored when re-enabled
- No data loss

### Scenario 10: Validation Errors

**Goal**: Verify input validation.

**Test Cases**:
- Enter negative manual valuation → Error
- Enter churn rate > 100 → Error
- Enter churn rate < 0 → Error
- Leave required field empty → Error with message

**Expected**:
- Clear error messages displayed
- Form cannot be submitted with invalid data
- Fields highlighted with error state

## Sample Test Data

### Contributors for Testing
```
| Name    | Slices | Expected % at $500K valuation |
|---------|--------|-------------------------------|
| Alice   | 10,000 | 50% ($250,000)                |
| Bob     | 6,000  | 30% ($150,000)                |
| Charlie | 4,000  | 20% ($100,000)                |
| TOTAL   | 20,000 | 100% ($500,000)               |
```

### Business Metrics for Auto-Calc Testing
```
| Year | Net Profit |
|------|------------|
| 2024 | $100,000   |
| 2023 | $80,000    |
| 2022 | $60,000    |
| 2021 | $40,000    |
| 2020 | $20,000    |

Churn Rate: 10%

Expected calculation:
- Average: $60,000
- Base: $60,000 × 3 = $180,000
- Growth: (100,000 - 20,000) / 20,000 / 4 = 100% → multiplier 1.5
- Retention: 1 - (0.10 × 0.3) = 0.97
- Final: $180,000 × 1.5 × 0.97 ≈ $261,900
```
