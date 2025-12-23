# Data Model: Import/Export UI Improvements

**Feature**: 007-import-export-ui
**Date**: 2025-12-23

## Overview

This feature is primarily UI-focused with no new data entities. It leverages existing data structures for import/export.

## Existing Entities (Referenced)

### SlicingPieExportData

The validated JSON structure used for import/export operations.

```typescript
interface SlicingPieExportData {
  version: string;           // Export format version (e.g., "1.0.0")
  exportedAt: string;        // ISO timestamp of export
  company: Company;          // Company configuration
  contributors: Contributor[]; // All contributors
  contributions: Contribution[]; // All contributions
}
```

**Validation Rules**:
- `version` must be a non-empty string
- `company` must have `name` property
- `contributors` array: each item must have `id`, `name`, `hourlyRate`
- `contributions` array: each item must have `id`, `contributorId`, `type`, `value`, `slices`

### Company (existing)

```typescript
interface Company {
  name: string;
  description?: string;
  // ... other optional fields
}
```

### Contributor (existing)

```typescript
interface Contributor {
  id: string;
  name: string;
  email?: string;
  hourlyRate: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Contribution (existing)

```typescript
interface Contribution {
  id: string;
  contributorId: string;
  type: ContributionType;
  value: number;
  description?: string;
  date: string;
  multiplier: number;
  slices: number;
  createdAt: string;
  updatedAt: string;
}
```

## Component Props (New)

### ImportConfirmModalProps

Props for the new reusable confirmation modal component.

```typescript
interface ImportConfirmModalProps {
  isOpen: boolean;              // Controls modal visibility
  onClose: () => void;          // Called when modal is closed/cancelled
  onConfirm: () => void;        // Called when import is confirmed
  onExportCurrent?: () => void; // Optional: exports current data
  importData: {                 // Preview data from selected file
    company: { name: string };
    contributors: unknown[];
    contributions: unknown[];
  } | null;
  hasExistingData?: boolean;    // Shows download button if true
}
```

### OnboardingModalProps (Updated)

```typescript
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onStartEmpty: () => void;
  onImportData: () => void;     // NEW: Triggers import flow
}
```

## State Management

### ImportConfirmModal Internal State

```typescript
// Checkbox confirmation state
const [isConfirmed, setIsConfirmed] = useState(false);

// Reset when modal closes
useEffect(() => {
  if (!isOpen) setIsConfirmed(false);
}, [isOpen]);
```

### OnboardingModal Internal State

```typescript
// Import flow state
const [showImportConfirm, setShowImportConfirm] = useState(false);
const [pendingImportData, setPendingImportData] = useState<SlicingPieExportData | null>(null);
```

## Data Flow

```text
User clicks "Import Data"
        ↓
File picker opens (useExport.importJSON)
        ↓
File selected → validateImportData()
        ↓
    Valid?
   /     \
  No      Yes
   ↓       ↓
Error   ImportConfirmModal opens
         ↓
  User checks checkbox
         ↓
  Import button enabled
         ↓
  User clicks Import
         ↓
  importData() called (context)
         ↓
  Modal closes, data loaded
```

## No Database Changes

This feature operates entirely on client-side state and localStorage. No schema migrations or new storage keys required.
