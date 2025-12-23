# Data Model: Soft Deletion

## Entity Changes

### SoftDeletable (Interface Extension)

Fields added to existing entities to support soft deletion:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deletedAt` | `string` (ISO timestamp) | No | When the item was soft-deleted. Null/undefined = active |
| `deletedWithParent` | `string` (entity ID) | No | If cascade-deleted, the parent contributor ID |

### Contributor (Extended)

```typescript
interface Contributor extends BaseEntity {
  // Existing fields
  name: string;
  email?: string;
  hourlyRate: number;
  active: boolean;
  vesting?: VestingConfig;

  // Soft deletion fields (NEW)
  deletedAt?: string;        // ISO timestamp when deleted
  deletedWithParent?: never; // Contributors are never cascade-deleted
}
```

### Contribution (Extended)

```typescript
interface Contribution extends BaseEntity {
  // Existing fields
  contributorId: string;
  type: ContributionType;
  value: number;
  description?: string;
  date: string;
  multiplier: number;
  slices: number;

  // Soft deletion fields (NEW)
  deletedAt?: string;         // ISO timestamp when deleted
  deletedWithParent?: string; // Contributor ID if cascade-deleted
}
```

### ActivityEvent (New Entity)

Tracks deletion and restoration events for audit purposes.

```typescript
interface ActivityEvent {
  id: string;                    // Unique event ID
  type: 'deleted' | 'restored';  // Event type
  entityType: 'contributor' | 'contribution'; // What was affected
  entityId: string;              // ID of affected entity
  entityName: string;            // Display name (for historical reference)
  timestamp: string;             // ISO timestamp when event occurred
  slicesAffected: number;        // Slices added/removed (for contributions)
  cascadeCount?: number;         // Number of contributions cascade-deleted (for contributors)
}
```

## State Transitions

### Contributor States

```
ACTIVE ─────────────────────────────────────────┐
   │                                            │
   │ softDelete()                               │
   ▼                                            │
DELETED ─────────────────────────────────────────┤
   │                                            │
   │ restore()                                  │
   └────────────────────────────────────────────┘
   │
   │ permanentDelete()
   ▼
REMOVED (no longer in storage)
```

### Contribution States

```
ACTIVE ─────────────────────────────────────────┐
   │                                            │
   │ softDelete() or                            │
   │ parent.softDelete() [cascade]              │
   ▼                                            │
DELETED ─────────────────────────────────────────┤
   │                                            │
   │ restore() or                               │
   │ parent.restore() [if cascade-deleted]      │
   └────────────────────────────────────────────┘
   │
   │ permanentDelete()
   ▼
REMOVED (no longer in storage)
```

## Validation Rules

### Soft Deletion

1. A contributor can only be soft-deleted if they are currently active (not already deleted)
2. When a contributor is soft-deleted, ALL their contributions are cascade-deleted with `deletedWithParent` set
3. A contribution can be soft-deleted independently of its contributor
4. Soft-deleted items MUST NOT be included in equity calculations

### Restoration

1. A contribution with `deletedWithParent` set is only restored when its parent contributor is restored
2. An individually deleted contribution (no `deletedWithParent`) is NOT restored when contributor is restored
3. Restoring a contributor also restores all cascade-deleted contributions
4. Restored items return to ACTIVE state with `deletedAt` cleared

### Permanent Deletion

1. Permanent deletion removes the item from storage entirely
2. Permanently deleting a contributor also permanently deletes all their contributions (active and deleted)
3. Permanent deletion is irreversible

## Relationships

```
Contributor (1) ────────────── (*) Contribution
    │                                │
    │ deletedAt                      │ deletedAt
    │                                │ deletedWithParent → Contributor.id
    │                                │
    └────────────────────────────────┘
           ▲
           │ Records events about
           │
    ActivityEvent
```

## Storage Keys

| Entity | localStorage Key |
|--------|------------------|
| Contributors | `slicingPie_contributors` |
| Contributions | `slicingPie_contributions` |
| Activity Events | `slicingPie_activityLog` |

## Filtering Logic

### Active Items (default views)

```typescript
const isActive = (entity: SoftDeletable) => !entity.deletedAt;
const activeContributors = contributors.filter(isActive);
const activeContributions = contributions.filter(isActive);
```

### Deleted Items (trash view)

```typescript
const isDeleted = (entity: SoftDeletable) => !!entity.deletedAt;
const deletedContributors = contributors.filter(isDeleted);
const deletedContributions = contributions.filter(isDeleted);
```

### Cascade-Deleted Items

```typescript
const isCascadeDeleted = (c: Contribution) =>
  !!c.deletedAt && !!c.deletedWithParent;
```
