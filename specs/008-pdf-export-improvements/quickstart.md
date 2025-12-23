# Quickstart: Improved PDF Export

**Feature**: 008-pdf-export-improvements
**Date**: 2025-12-23

## Overview

This guide demonstrates how to use the enhanced PDF export feature and integrate it into new components.

---

## Basic Usage

### 1. Export PDF from Dashboard

```tsx
// In dashboard or any page with export functionality
import { usePDFExport } from '@/hooks/usePDFExport';
import { PDFExportOptions } from '@/components/export/PDFExportOptions';

function ExportSection() {
  const { company, contributors, contributions } = useSlicingPie();
  const { currentValuation } = useValuation();
  const { vestingActive } = useFeatureFlagsContext();

  const [options, setOptions] = useState<PDFExportOptions>({
    includeContributionsBreakdown: true,
    includeValuation: false,
    includeVesting: false,
  });

  const { status, progress, exportPDF } = usePDFExport(
    company,
    contributors,
    contributions,
    currentValuation
  );

  return (
    <div>
      <PDFExportOptions
        options={options}
        onChange={setOptions}
        valuationAvailable={currentValuation !== null}
        vestingEnabled={vestingActive}
      />

      <Button
        onClick={() => exportPDF(options)}
        disabled={status === 'rendering'}
      >
        {status === 'rendering' ? `Exporting... ${progress}%` : 'Export PDF'}
      </Button>
    </div>
  );
}
```

### 2. Quick Export (Default Options)

```tsx
// Simple one-click export with defaults
import { usePDFExport } from '@/hooks/usePDFExport';

function QuickExportButton() {
  const { company, contributors, contributions } = useSlicingPie();
  const { exportPDF, status } = usePDFExport(company, contributors, contributions, null);

  const handleExport = () => {
    exportPDF({
      includeContributionsBreakdown: true,
      includeValuation: false,
      includeVesting: false,
    });
  };

  return (
    <Button onClick={handleExport} disabled={status !== 'idle'}>
      Export PDF
    </Button>
  );
}
```

---

## Integration Scenarios

### Scenario 1: Dashboard Export Panel

**Goal**: Add PDF export options to existing export panel on dashboard.

```tsx
// src/app/page.tsx (dashboard)
<LocalStorageBanner
  company={company}
  contributors={contributors}
  contributions={contributions}
  onImport={handleImport}
  // PDF options passed through to ExportPanel
  pdfOptions={{
    valuationAvailable: isValuationSet,
    vestingEnabled: vestingActive,
  }}
/>
```

### Scenario 2: Settings Page Full Export

**Goal**: Comprehensive export controls in settings.

```tsx
// src/app/settings/page.tsx
function SettingsExport() {
  // ... existing state

  return (
    <section>
      <h2>Export Data</h2>

      {/* JSON/Excel exports remain unchanged */}
      <ExportPanel
        jsonData={exportData}
        excelSheets={excelSheets}
      />

      {/* New PDF export section */}
      <div className="mt-6 border-t pt-6">
        <h3>PDF Report</h3>
        <PDFExportOptions ... />
        <PDFExportButton ... />
      </div>
    </section>
  );
}
```

### Scenario 3: Standalone PDF Preview

**Goal**: Show what will be in the PDF before exporting.

```tsx
function PDFPreview({ options }: { options: PDFExportOptions }) {
  const preview = useMemo(() => {
    const sections = ['Pie Chart', 'Summary Table'];
    if (options.includeContributionsBreakdown) {
      sections.push('Contributions Breakdown');
    }
    if (options.includeValuation) {
      sections.push('Equity Values ($)');
    }
    if (options.includeVesting) {
      sections.push('Vesting Breakdown', 'Vesting Projections');
    }
    return sections;
  }, [options]);

  return (
    <div className="text-sm text-gray-600">
      <p>Your PDF will include:</p>
      <ul className="list-disc list-inside">
        {preview.map(section => (
          <li key={section}>{section}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Testing the Feature

### Manual Test Cases

1. **Basic Export (P1)**
   - Add 3 contributors with various contributions
   - Click "Export PDF"
   - Verify: Header shows company name and date
   - Verify: Pie chart displays with correct proportions
   - Verify: Summary table shows all contributors

2. **Contributions Breakdown (P2)**
   - Enable "Include contributions breakdown"
   - Export PDF
   - Verify: Each contributor has a section
   - Verify: All contribution types appear correctly
   - Verify: Subtotals are accurate

3. **Valuation Toggle (P3)**
   - Set company valuation to $1,000,000
   - Enable "Include valuation"
   - Export PDF
   - Verify: Dollar values appear in summary table
   - Verify: Values are correctly calculated

4. **Vesting Toggle (P4)**
   - Enable vesting feature flag
   - Configure vesting for at least one contributor
   - Enable "Include vesting breakdown"
   - Export PDF
   - Verify: Vested/unvested columns appear
   - Verify: Projections table shows future dates

5. **Edge Cases**
   - Export with no contributions (should show message)
   - Export with 10+ contributors (legend should be readable)
   - Export with 50+ contributions (pagination should work)

---

## Common Patterns

### Conditional Feature Display

```tsx
// Only show vesting option when feature is enabled
{vestingActive && (
  <Toggle
    label="Include vesting breakdown"
    checked={options.includeVesting}
    onChange={(v) => setOptions({ ...options, includeVesting: v })}
  />
)}
```

### Disabled State with Explanation

```tsx
// Disable valuation toggle with reason
<Toggle
  label="Include valuation"
  checked={options.includeValuation}
  onChange={(v) => setOptions({ ...options, includeValuation: v })}
  disabled={!valuationAvailable}
  tooltip={!valuationAvailable ? "Set a company valuation in Settings first" : undefined}
/>
```

### Progress Feedback

```tsx
// Show export progress
{status === 'rendering' && (
  <div className="flex items-center gap-2">
    <Spinner />
    <span>Generating PDF... {progress}%</span>
  </div>
)}
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Chart not appearing in PDF | Chart not rendered before capture | Ensure chart is mounted and visible (can use hidden container) |
| Blurry chart in PDF | Low scale factor | Increase `scale` option in chartRenderOptions to 2 or 3 |
| PDF too large | High resolution chart | Reduce scale or chart dimensions |
| Vesting toggle missing | Feature flag disabled | Enable `vestingActive` in feature flags |
| Valuation toggle disabled | No valuation set | Configure company valuation in Settings |
