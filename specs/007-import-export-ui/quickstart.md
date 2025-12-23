# Quickstart: Import/Export UI Improvements

**Feature**: 007-import-export-ui
**Date**: 2025-12-23

## Overview

This guide provides step-by-step implementation instructions for improving the import/export UI.

## Prerequisites

- Existing `ImportConfirmModal.tsx` component (partially implemented)
- Existing `OnboardingModal.tsx` component
- Existing `LocalStorageBanner.tsx` component
- Existing `importData()` function in SlicingPieContext

## Implementation Steps

### Step 1: Complete ImportConfirmModal Component

The component should already exist at `src/components/slicing-pie/ImportConfirmModal.tsx`. Verify it includes:

```typescript
interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onExportCurrent?: () => void;
  importData: ImportData | null;
  hasExistingData?: boolean;
}
```

Key features:
- Checkbox that enables/disables Import button
- "Download current data first" button (conditional on hasExistingData)
- Data preview showing company name and counts

### Step 2: Update OnboardingModal

Modify `src/components/slicing-pie/OnboardingModal.tsx`:

1. Add new prop `onImportData`
2. Reorder buttons: Import Data -> Start Empty -> Sample Data
3. Update Sample Data description
4. Add import flow state management

```tsx
// Button order
<Button onClick={handleImportClick}>Import Data</Button>
<Button onClick={onStartEmpty}>Start Empty</Button>
<Button onClick={onLoadSampleData}>
  Load Sample Data
  <span className="text-xs">See the platform in action</span>
</Button>
```

### Step 3: Update LocalStorageBanner

Modify `src/components/slicing-pie/LocalStorageBanner.tsx`:

1. Remove inline confirmation modal JSX
2. Import and use ImportConfirmModal
3. Pass hasExistingData prop

```tsx
import { ImportConfirmModal } from "./ImportConfirmModal";

// In component
<ImportConfirmModal
  isOpen={showImportModal}
  onClose={handleCancelImport}
  onConfirm={handleConfirmImport}
  onExportCurrent={handleExport}
  importData={pendingImportData}
  hasExistingData={contributors.length > 0 || contributions.length > 0}
/>
```

### Step 4: Update Dashboard Page

Modify `src/app/page.tsx`:

1. Add import handler for onboarding modal
2. Pass handler to OnboardingModal

```tsx
const handleOnboardingImport = async () => {
  try {
    const data = await importJSON<SlicingPieExportData>();
    if (!validateImportData(data)) {
      // Show error
      return;
    }
    setPendingImportData(data);
    setShowImportConfirm(true);
  } catch {
    // User cancelled
  }
};

<OnboardingModal
  isOpen={showOnboarding}
  onClose={handleDismissOnboarding}
  onLoadSampleData={handleLoadSampleData}
  onStartEmpty={handleDismissOnboarding}
  onImportData={handleOnboardingImport}
/>
```

### Step 5: Update Settings Page (Optional)

If settings page has its own import flow, update to use ImportConfirmModal.

## Testing

### Manual Testing Checklist

1. **Onboarding Modal**
   - [ ] Fresh browser shows onboarding modal
   - [ ] Import Data is first button
   - [ ] Start Empty is second button
   - [ ] Sample Data is third with description
   - [ ] Clicking Import Data opens file picker
   - [ ] Selecting valid file shows confirmation modal

2. **Import Confirmation Modal**
   - [ ] Import button is disabled by default
   - [ ] Checking checkbox enables Import button
   - [ ] Unchecking disables Import button
   - [ ] Data preview shows company name and counts
   - [ ] Cancel closes modal without importing
   - [ ] Import loads data and closes modal

3. **Download Current Data**
   - [ ] Button visible when user has existing data
   - [ ] Button hidden when no existing data
   - [ ] Clicking downloads JSON file
   - [ ] Can still proceed with import after download

4. **Consistency**
   - [ ] Same confirmation modal in onboarding
   - [ ] Same confirmation modal in dashboard banner
   - [ ] Same confirmation modal in settings

## Files Changed

| File | Changes |
|------|---------|
| `src/components/slicing-pie/ImportConfirmModal.tsx` | Complete component |
| `src/components/slicing-pie/OnboardingModal.tsx` | Add import, reorder buttons |
| `src/components/slicing-pie/LocalStorageBanner.tsx` | Use ImportConfirmModal |
| `src/app/page.tsx` | Wire up onboarding import |
| `src/app/settings/page.tsx` | Use ImportConfirmModal |

## Next Steps

After implementation, run `/speckit.tasks` to generate the task breakdown.
