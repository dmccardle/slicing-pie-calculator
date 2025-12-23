# Research: Company Valuation Configuration

**Feature**: 004-company-valuation
**Date**: 2025-12-22

## Research Topics

### 1. Valuation Formula for Auto-Calculate Mode

**Decision**: Use a simplified Seller's Discretionary Earnings (SDE) multiple approach, adjusted for growth and churn.

**Formula**:
```
Base Valuation = Average Net Profit × Base Multiple
Adjusted Valuation = Base Valuation × Growth Multiplier × Retention Multiplier

Where:
- Average Net Profit = (Sum of all years provided) / (Number of years)
- Base Multiple = 3.0 (standard for small businesses)
- Growth Multiplier = 1 + (Growth Rate × 0.5), clamped to [0.5, 2.0]
- Growth Rate = (Latest Year - Earliest Year) / Earliest Year / Years
- Retention Multiplier = 1 - (Churn Rate × 0.3), clamped to [0.5, 1.0]
```

**Rationale**:
- SDE multiples are industry-standard for small business valuations
- 3x base multiple is conservative and appropriate for early-stage companies
- Growth adjustment rewards improving profitability
- Churn penalty reflects customer retention risk in SaaS/subscription models
- Formula is transparent and explainable to users

**Alternatives Considered**:
1. **Revenue multiple (ARR × X)**: Rejected - requires revenue data which may not be available; profit-based is more universal
2. **DCF (Discounted Cash Flow)**: Rejected - too complex for a rough estimate tool; requires projections
3. **Comparable company analysis**: Rejected - requires external data; violates local-first principle

### 2. Confidence Indicator for Partial Data

**Decision**: Display confidence level based on data completeness.

**Levels**:
- **High** (green): 3+ years of profit data + churn rate provided
- **Medium** (yellow): 1-2 years of profit data OR missing churn rate
- **Low** (orange): Only current year profit, no history

**Rationale**: Users should understand that more historical data produces more reliable estimates.

### 3. Number Formatting for Large Values

**Decision**: Use compact notation with appropriate suffixes.

**Format Rules**:
- < $1,000: Show full number ($500)
- $1,000 - $999,999: Use K suffix ($500K)
- $1,000,000 - $999,999,999: Use M suffix ($1.5M)
- >= $1,000,000,000: Use B suffix ($1.2B)

**Implementation**: Use `Intl.NumberFormat` with `notation: 'compact'` for consistency.

### 4. Valuation History Storage Limit

**Decision**: Store last 20 valuation entries.

**Rationale**:
- Sufficient for tracking changes over time
- Prevents localStorage bloat
- FIFO (first-in-first-out) when limit reached

### 5. Disclaimer Text

**Decision**: Use clear, prominent warning text.

**Text**:
> "IMPORTANT: This is NOT an official legal valuation. The estimated value shown is a rough calculation based on the data you provided and standard industry formulas. It should only be used as a starting point for internal discussions among contributors. For any legal, tax, or investment purposes, please consult a qualified professional."

**Rationale**: Must be prominent enough to prevent misunderstanding while not being so intrusive it disrupts workflow.

### 6. First-Time Acknowledgment Flow

**Decision**: Modal dialog requiring checkbox acknowledgment before first save.

**Flow**:
1. User enters valuation data and clicks "Save"
2. Modal appears with full disclaimer text
3. Checkbox: "I understand this is not a legal valuation"
4. "Accept & Save" button (disabled until checkbox checked)
5. After acknowledgment, save proceeds; future saves don't require re-acknowledgment

**Storage**: Store `disclaimerAcknowledged: boolean` in ValuationConfig.

## Implementation Notes

- All calculations performed client-side in utility functions
- Valuation data persisted via existing `useLocalStorage` hook pattern
- Feature flag follows existing `vestingEnabled` pattern exactly
- Equity Values page conditionally rendered in navigation based on flag
