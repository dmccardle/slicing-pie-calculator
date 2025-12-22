# Data Model: Slicing Pie Equity Calculator

**Date**: 2025-12-22
**Version**: 1.0

## Entity Overview

```
Company (1) ─────────── Settings/Metadata
    │
    └── Contributor (N) ─── Team members with hourly rates
            │
            └── Contribution (N) ─── Logged contributions with slice calculations
```

## Entities

### Company

Represents the startup or project being tracked. Single instance per app.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Company or project name |
| description | string | No | Optional description |

**Validation**:
- `name`: 1-100 characters, trimmed
- `description`: 0-500 characters

**Storage Key**: `slicingPie_company`

---

### Contributor

A person who contributes to the startup and earns equity.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | UUID, auto-generated |
| name | string | Yes | Contributor's display name |
| email | string | No | Contact email (optional) |
| hourlyRate | number | Yes | Theoretical market hourly rate in USD |
| createdAt | string | Yes | ISO 8601 timestamp |
| active | boolean | Yes | Whether contributor can add new contributions |

**Validation**:
- `name`: 1-100 characters, trimmed, unique
- `email`: Valid email format or empty
- `hourlyRate`: >= 0, max 2 decimal places

**Storage Key**: `slicingPie_contributors`

**Computed Properties** (not stored, calculated at runtime):
- `totalSlices`: Sum of all contribution slices for this contributor
- `equityPercentage`: (totalSlices / allContributorsTotalSlices) * 100

---

### Contribution

A single contribution made by a contributor.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | UUID, auto-generated |
| contributorId | string | Yes | Reference to Contributor.id |
| type | ContributionType | Yes | Type of contribution |
| value | number | Yes | Raw value (hours, dollars, etc.) |
| description | string | No | Notes about this contribution |
| date | string | Yes | ISO 8601 date (YYYY-MM-DD) |
| multiplier | number | Yes | Applied multiplier (auto-calculated) |
| slices | number | Yes | Calculated slices (auto-calculated) |
| createdAt | string | Yes | ISO 8601 timestamp |

**ContributionType Enum**:
```typescript
type ContributionType = 'time' | 'cash' | 'non-cash' | 'idea' | 'relationship';
```

**Validation**:
- `contributorId`: Must reference existing active contributor
- `value`: > 0
- `date`: Valid ISO date, not in future
- `description`: 0-500 characters

**Storage Key**: `slicingPie_contributions`

**Auto-Calculated Fields**:
- `multiplier`: Based on type (time: 2, cash: 4, non-cash: 2, idea: 1, relationship: 1)
- `slices`:
  - For time: `value (hours) * contributor.hourlyRate * 2`
  - For cash: `value * 4`
  - For non-cash: `value * 2`
  - For idea/relationship: `value * 1`

---

## TypeScript Interfaces

```typescript
// src/types/slicingPie.ts

export interface Company {
  name: string;
  description?: string;
}

export interface Contributor {
  id: string;
  name: string;
  email?: string;
  hourlyRate: number;
  createdAt: string;
  active: boolean;
}

export type ContributionType = 'time' | 'cash' | 'non-cash' | 'idea' | 'relationship';

export interface Contribution {
  id: string;
  contributorId: string;
  type: ContributionType;
  value: number;
  description?: string;
  date: string;
  multiplier: number;
  slices: number;
  createdAt: string;
}

// Computed type for display
export interface ContributorWithEquity extends Contributor {
  totalSlices: number;
  equityPercentage: number;
}

// Full app state for export/import
export interface SlicingPieData {
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
  exportedAt: string;
}
```

---

## Multiplier Constants

```typescript
// src/utils/slicingPie.ts

export const MULTIPLIERS: Record<ContributionType, number> = {
  time: 2,
  cash: 4,
  'non-cash': 2,
  idea: 1,
  relationship: 1,
};

export const CONTRIBUTION_LABELS: Record<ContributionType, string> = {
  time: 'Time (Unpaid)',
  cash: 'Cash Investment',
  'non-cash': 'Non-Cash (Equipment, etc.)',
  idea: 'Idea / IP',
  relationship: 'Relationship / Sales',
};
```

---

## Calculation Functions

```typescript
// src/utils/slicingPie.ts

export function calculateSlices(
  type: ContributionType,
  value: number,
  hourlyRate?: number
): number {
  const multiplier = MULTIPLIERS[type];

  if (type === 'time' && hourlyRate !== undefined) {
    return value * hourlyRate * multiplier;
  }

  return value * multiplier;
}

export function calculateEquityPercentage(
  contributorSlices: number,
  totalSlices: number
): number {
  if (totalSlices === 0) return 0;
  return (contributorSlices / totalSlices) * 100;
}

export function getContributorTotalSlices(
  contributorId: string,
  contributions: Contribution[]
): number {
  return contributions
    .filter(c => c.contributorId === contributorId)
    .reduce((sum, c) => sum + c.slices, 0);
}

export function getTotalSlices(contributions: Contribution[]): number {
  return contributions.reduce((sum, c) => sum + c.slices, 0);
}
```

---

## Data Relationships

### Contributor -> Contribution (1:N)

- A contributor can have many contributions
- Contributions reference contributors via `contributorId`
- When a contributor is deactivated:
  - Existing contributions are preserved
  - No new contributions can be added
  - Their equity % continues to display

### Cascade Rules

| Action | Effect |
|--------|--------|
| Delete contributor | Soft delete (set active=false), preserve contributions |
| Edit contributor hourlyRate | Does NOT recalculate existing time contributions |
| Delete contribution | Hard delete, immediately updates equity % |
| Import data | Replaces all data after confirmation |

---

## Sample Data

```typescript
// src/lib/sampleData.ts

export const SAMPLE_COMPANY: Company = {
  name: 'Acme Startup',
  description: 'Sample company for demonstration',
};

export const SAMPLE_CONTRIBUTORS: Contributor[] = [
  {
    id: 'sample-1',
    name: 'Alice Developer',
    email: 'alice@example.com',
    hourlyRate: 150,
    createdAt: '2024-01-01T00:00:00Z',
    active: true,
  },
  {
    id: 'sample-2',
    name: 'Bob Designer',
    email: 'bob@example.com',
    hourlyRate: 125,
    createdAt: '2024-01-15T00:00:00Z',
    active: true,
  },
  {
    id: 'sample-3',
    name: 'Carol Investor',
    hourlyRate: 0,
    createdAt: '2024-02-01T00:00:00Z',
    active: true,
  },
];

export const SAMPLE_CONTRIBUTIONS: Contribution[] = [
  // Alice: 40 hours @ $150/hr = 40 * 150 * 2 = 12,000 slices
  {
    id: 'contrib-1',
    contributorId: 'sample-1',
    type: 'time',
    value: 40,
    description: 'Initial product development',
    date: '2024-01-15',
    multiplier: 2,
    slices: 12000,
    createdAt: '2024-01-15T00:00:00Z',
  },
  // Bob: 20 hours @ $125/hr = 20 * 125 * 2 = 5,000 slices
  {
    id: 'contrib-2',
    contributorId: 'sample-2',
    type: 'time',
    value: 20,
    description: 'UI/UX design work',
    date: '2024-01-20',
    multiplier: 2,
    slices: 5000,
    createdAt: '2024-01-20T00:00:00Z',
  },
  // Carol: $5,000 cash = 5000 * 4 = 20,000 slices
  {
    id: 'contrib-3',
    contributorId: 'sample-3',
    type: 'cash',
    value: 5000,
    description: 'Seed investment',
    date: '2024-02-01',
    multiplier: 4,
    slices: 20000,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// Total: 37,000 slices
// Alice: 12,000 / 37,000 = 32.4%
// Bob: 5,000 / 37,000 = 13.5%
// Carol: 20,000 / 37,000 = 54.1%
```
