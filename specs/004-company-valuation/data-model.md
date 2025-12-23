# Data Model: Company Valuation Configuration

**Feature**: 004-company-valuation
**Date**: 2025-12-22

## Entities

### ValuationConfig

The main configuration entity for company valuation settings.

```typescript
interface ValuationConfig {
  // Feature state
  enabled: boolean;                    // Whether valuation feature is active
  disclaimerAcknowledged: boolean;     // User has accepted legal disclaimer

  // Mode selection
  mode: 'manual' | 'auto';             // Which calculation mode is active

  // Manual mode data
  manualValue: number | null;          // User-entered valuation (in cents to avoid float issues)

  // Auto mode data
  businessMetrics: BusinessMetrics | null;

  // Computed (derived, not stored)
  // calculatedValue: number;          // Computed from businessMetrics when mode='auto'

  // Metadata
  lastUpdated: string;                 // ISO timestamp
}
```

**Storage Key**: `slicingPie_valuationConfig`

**Validation Rules**:
- `manualValue`: Must be positive integer (cents) or null
- `mode`: Must be 'manual' or 'auto'
- When `mode === 'manual'`, `manualValue` must be set
- When `mode === 'auto'`, `businessMetrics` must have at least `currentYearProfit`

### BusinessMetrics

Sub-entity containing business performance data for auto-calculation.

```typescript
interface BusinessMetrics {
  // Current year profit (required for auto mode)
  currentYearProfit: number;           // In cents (can be negative)

  // Historical profit data (optional, improves accuracy)
  profitHistory: ProfitYear[];         // Up to 5 previous years

  // Customer metrics (optional)
  churnRate: number | null;            // 0-100 (percentage)
}

interface ProfitYear {
  year: number;                        // e.g., 2024
  profit: number;                      // In cents (can be negative)
}
```

**Validation Rules**:
- `currentYearProfit`: Required, integer (cents)
- `profitHistory`: Array of 0-5 items, sorted by year descending
- `profitHistory[].year`: 4-digit year, must be < current year
- `churnRate`: null or 0-100 (percentage)

### ValuationHistoryEntry

A snapshot of a valuation at a point in time.

```typescript
interface ValuationHistoryEntry {
  id: string;                          // Unique identifier (UUID)
  timestamp: string;                   // ISO timestamp when saved
  mode: 'manual' | 'auto';             // Mode used for this entry
  value: number;                       // Valuation in cents

  // Snapshot of inputs (for display/restore)
  manualValue: number | null;
  businessMetrics: BusinessMetrics | null;
}
```

**Storage Key**: `slicingPie_valuationHistory`

**Storage Rules**:
- Maximum 20 entries (FIFO when exceeded)
- New entry created on each save (not on every edit)
- Entries are immutable once created

### EquityValueRow (Computed, not stored)

Computed entity for displaying the Equity Values table.

```typescript
interface EquityValueRow {
  contributorId: string;
  contributorName: string;
  slices: number;                      // Total slices
  percentage: number;                  // 0-100
  totalValue: number;                  // In cents (slices/totalSlices * valuation)

  // Optional: only present if vesting enabled
  vestedSlices?: number;
  vestedPercentage?: number;
  vestedValue?: number;
}
```

**Computation**:
```
totalValue = (contributor.slices / sumOfAllSlices) * currentValuation
vestedValue = (contributor.vestedSlices / sumOfAllSlices) * currentValuation
```

## Feature Flags Extension

Extend existing `FeatureFlags` interface:

```typescript
interface FeatureFlags {
  vestingEnabled: boolean;             // Existing
  valuationEnabled: boolean;           // NEW
}
```

**Environment Variable**: `NEXT_PUBLIC_VALUATION_ENABLED`

## Relationships

```
┌─────────────────────┐
│   FeatureFlags      │
│  valuationEnabled   │──────────┐
└─────────────────────┘          │
                                 │ controls visibility
┌─────────────────────┐          │
│  ValuationConfig    │◄─────────┘
│  - mode             │
│  - manualValue      │
│  - businessMetrics  │──────────┐
│  - disclaimerAck    │          │
└─────────────────────┘          │
         │                       │
         │ history               │ contains
         ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│ ValuationHistory[]  │   │  BusinessMetrics    │
│  (max 20 entries)   │   │  - currentYearProfit│
└─────────────────────┘   │  - profitHistory[]  │
                          │  - churnRate        │
                          └─────────────────────┘

┌─────────────────────┐   ┌─────────────────────┐
│   Contributors      │   │   ValuationConfig   │
│  (existing entity)  │   │   (current value)   │
└─────────────────────┘   └─────────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌───────────────────────────────────────────────┐
│              EquityValueRow[]                  │
│  (computed at render time for table display)  │
└───────────────────────────────────────────────┘
```

## Default Values

```typescript
const DEFAULT_VALUATION_CONFIG: ValuationConfig = {
  enabled: false,  // Overridden by env var
  disclaimerAcknowledged: false,
  mode: 'manual',
  manualValue: null,
  businessMetrics: null,
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_BUSINESS_METRICS: BusinessMetrics = {
  currentYearProfit: 0,
  profitHistory: [],
  churnRate: null,
};
```

## Currency Handling

All monetary values stored in **cents** (integer) to avoid floating-point precision issues:
- $500,000 stored as `50000000`
- Display formatting handles conversion: `value / 100`
- Input fields accept dollar amounts and convert on save
