# Research: Improved PDF Export

**Feature**: 008-pdf-export-improvements
**Date**: 2025-12-23

## Research Questions

1. How to render Recharts pie chart as static image for PDF embedding?
2. What is the best approach for multi-section PDF layout with charts and tables?
3. How to handle pagination for variable-length content?

---

## R1: Chart Rendering for PDF

### Decision: Use html2canvas to capture rendered chart

### Rationale

Recharts renders SVG elements in the DOM. To include charts in jsPDF, we need to convert the SVG/DOM to a raster image (PNG/JPEG). html2canvas is the most reliable approach for capturing rendered React components.

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **html2canvas** | Works with any DOM element, battle-tested, handles CSS styles | Requires chart to be rendered (can use hidden container), slight quality loss | SELECTED |
| **recharts-to-png** | Purpose-built for Recharts | Less maintained, adds another dependency | Rejected |
| **SVG serialization + canvg** | Direct SVG handling, no DOM render needed | Complex setup, inconsistent font rendering | Rejected |
| **Server-side rendering** | High quality | Violates local-first principle, adds backend dependency | Rejected |

### Implementation Approach

1. Render PieChart component in a hidden container (off-screen but in DOM)
2. Use html2canvas to capture the container as a canvas
3. Convert canvas to PNG data URL
4. Embed in PDF using `doc.addImage()`
5. Remove hidden container after capture

### Code Pattern

```typescript
async function chartToImage(
  chartElement: HTMLElement,
  options: { width: number; height: number }
): Promise<string> {
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution for print quality
    logging: false,
    width: options.width,
    height: options.height,
  });
  return canvas.toDataURL('image/png');
}
```

---

## R2: PDF Layout Strategy

### Decision: Section-based layout with explicit Y-position tracking

### Rationale

jsPDF requires manual positioning. Using a section-based approach with a layout manager allows consistent spacing and automatic page breaks.

### Layout Structure

```text
Page 1:
┌─────────────────────────────────────┐
│ Header: Company Name + Date         │ 20px
├─────────────────────────────────────┤
│                                     │
│           [PIE CHART]               │ 150px
│                                     │
├─────────────────────────────────────┤
│ Summary Table                       │
│ Name | Slices | % [| $ | Vested]   │ Variable
├─────────────────────────────────────┤
│ [Page break if needed]              │
└─────────────────────────────────────┘

Page 2+ (if contributions breakdown enabled):
┌─────────────────────────────────────┐
│ Contributions Breakdown             │
│ ─────────────────────               │
│ Contributor A (subtotal: X slices)  │
│   Date | Type | Desc | Value | Slices│
│ Contributor B (subtotal: Y slices)  │
│   ...                               │
└─────────────────────────────────────┘

Final Section (if vesting enabled):
┌─────────────────────────────────────┐
│ Vesting Projections                 │
│ Date | Contributor | Vested | Unvested │
└─────────────────────────────────────┘
```

### Implementation Approach

```typescript
interface PDFSection {
  type: 'header' | 'chart' | 'table' | 'pageBreak';
  render: (doc: jsPDF, yPosition: number) => number; // Returns new Y position
}

function buildPDF(sections: PDFSection[]): jsPDF {
  const doc = new jsPDF();
  let y = 20; // Starting position

  for (const section of sections) {
    if (y > 250) { // Page break threshold
      doc.addPage();
      y = 20;
    }
    y = section.render(doc, y);
  }

  return doc;
}
```

---

## R3: Pagination Strategy

### Decision: Use autoTable's built-in pagination + manual breaks between sections

### Rationale

jspdf-autotable already handles table pagination automatically. For charts and headers, we manually check remaining space before rendering.

### Rules

1. **Header**: Always fits on one line (no pagination needed)
2. **Chart**: Fixed height (150px), check if space available, else new page
3. **Summary Table**: Let autoTable handle pagination
4. **Contributor Sections**: Start each contributor on same page as header if possible
5. **Vesting Projections**: Let autoTable handle pagination

### Space Check Pattern

```typescript
const PAGE_HEIGHT = 280; // A4 usable height in mm
const MARGIN_BOTTOM = 20;

function needsNewPage(currentY: number, contentHeight: number): boolean {
  return currentY + contentHeight > PAGE_HEIGHT - MARGIN_BOTTOM;
}
```

---

## R4: Color Consistency

### Decision: Export DEFAULT_COLORS from PieChart and reuse in PDF

### Rationale

The pie chart in the app uses a specific color palette. The PDF should use the same colors for consistency.

### Implementation

```typescript
// src/components/charts/PieChart.tsx - export the colors
export const CHART_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#d97706",
  "#7c3aed", "#0891b2", "#c026d3", "#ea580c",
];

// PDF renderer uses same colors for chart segments
```

---

## R5: Dependencies

### New Dependency: html2canvas

**Package**: `html2canvas`
**Version**: ^1.4.1 (latest stable)
**Size**: ~40KB gzipped
**Purpose**: Convert DOM elements to canvas for PDF image embedding

### Installation

```bash
npm install html2canvas
```

### No Other New Dependencies Needed

- jsPDF: Already installed
- jspdf-autotable: Already installed
- Recharts: Already installed

---

## Summary of Decisions

| Question | Decision | Key Reason |
|----------|----------|------------|
| Chart to image | html2canvas | Reliable, works with React DOM |
| PDF layout | Section-based with Y tracking | Clean separation, predictable pagination |
| Pagination | autoTable + manual checks | Leverage existing library, consistent behavior |
| Colors | Export from PieChart, reuse | Visual consistency between app and PDF |
| New dependencies | html2canvas only | Minimal additions, follows simplicity principle |
