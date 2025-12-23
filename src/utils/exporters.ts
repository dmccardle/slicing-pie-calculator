/**
 * Export utilities for JSON, Excel, and PDF
 */

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PDFExportOptions, PDFReportData } from "@/types";

/**
 * Export data to JSON file and trigger download
 */
export function exportToJSON<T>(data: T, filename: string = "export"): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 * Returns a promise that resolves with the parsed data
 */
export function importFromJSON<T>(): Promise<T> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content) as T;
          resolve(data);
        } catch {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * Sheet data for Excel export
 */
export interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
  columns?: { key: string; header: string; width?: number }[];
}

/**
 * Export data to Excel file with multiple sheets
 */
export async function exportToExcel(
  sheets: ExcelSheet[],
  filename: string = "export"
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheet) => {
    const worksheet = workbook.addWorksheet(sheet.name);

    // Set up columns with headers
    if (sheet.columns && sheet.columns.length > 0) {
      worksheet.columns = sheet.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 15,
      }));

      // Add data rows
      sheet.data.forEach((row) => {
        worksheet.addRow(row);
      });
    } else {
      // No column config - use keys from first data row
      if (sheet.data.length > 0) {
        const keys = Object.keys(sheet.data[0]);
        worksheet.columns = keys.map((key) => ({
          header: key,
          key: key,
          width: 15,
        }));
        sheet.data.forEach((row) => {
          worksheet.addRow(row);
        });
      }
    }

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * PDF table data
 */
export interface PDFTableData {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Export data to PDF with optional tables and summary
 */
export function exportToPDF(
  title: string,
  tables: PDFTableData[],
  filename: string = "export"
): void {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, yPosition);
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPosition);
  yPosition += 15;

  // Reset text color
  doc.setTextColor(0);

  // Tables
  tables.forEach((table, index) => {
    // Table title
    if (table.title) {
      doc.setFontSize(14);
      doc.text(table.title, 14, yPosition);
      yPosition += 8;
    }

    // Table content
    autoTable(doc, {
      head: [table.headers],
      body: table.rows,
      startY: yPosition,
      theme: "striped",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235], // blue-600
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
    });

    // Get the final Y position after the table
    yPosition = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPosition;
    yPosition += 15;

    // Add page break if needed (except for last table)
    if (index < tables.length - 1 && yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Enhanced PDF export options
 */
export interface EnhancedPDFOptions {
  /** Report data */
  data: PDFReportData;

  /** Chart image as data URL (optional) */
  chartImage?: string;

  /** Export options */
  options: PDFExportOptions;

  /** Output filename (without extension) */
  filename: string;
}

/**
 * Page layout constants
 */
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN_LEFT = 14;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 20;

/**
 * Check if content fits on current page, add new page if needed
 */
function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  contentHeight: number
): number {
  if (currentY + contentHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return currentY;
}

/**
 * Format a number with thousands separator
 */
function formatNumberForPDF(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a currency value for PDF display
 */
function formatCurrencyForPDF(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Generates and downloads an enhanced PDF report
 */
export async function exportEnhancedPDF(
  enhancedOptions: EnhancedPDFOptions
): Promise<void> {
  const { data, chartImage, options, filename } = enhancedOptions;
  const doc = new jsPDF();
  let yPosition = MARGIN_TOP;

  // ========== SECTION 1: Header ==========
  // Company name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.companyName, MARGIN_LEFT, yPosition);
  yPosition += 8;

  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Equity Report", MARGIN_LEFT, yPosition);
  yPosition += 6;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  const exportDate = new Date(data.exportDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${exportDate}`, MARGIN_LEFT, yPosition);
  doc.setTextColor(0);
  yPosition += 15;

  // ========== SECTION 2: Pie Chart ==========
  if (chartImage) {
    // Chart is 500x300 (5:3 ratio) with legend on right side
    const chartWidth = 150;
    const chartHeight = 90;
    const chartX = (PAGE_WIDTH - chartWidth) / 2; // Center the chart

    yPosition = checkPageBreak(doc, yPosition, chartHeight + 10);

    try {
      doc.addImage(chartImage, "PNG", chartX, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 15;
    } catch {
      // If chart image fails, continue without it
      console.warn("Failed to add chart image to PDF");
    }
  }

  // ========== SECTION 3: Summary Table ==========
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Equity Summary", MARGIN_LEFT, yPosition);
  yPosition += 8;

  // Build summary table columns based on options
  const summaryHeaders: string[] = ["Name", "Slices", "%"];
  if (options.includeValuation && data.companyValuation) {
    summaryHeaders.push("Value");
  }
  if (options.includeVesting) {
    summaryHeaders.push("Vested", "Unvested");
  }

  // Build summary table rows
  const summaryRows = data.summaryRows.map((row) => {
    const rowData: (string | number)[] = [
      row.name,
      formatNumberForPDF(row.totalSlices),
      `${formatNumberForPDF(row.percentage, 1)}%`,
    ];

    if (options.includeValuation && data.companyValuation) {
      rowData.push(row.dollarValue ? formatCurrencyForPDF(row.dollarValue) : "-");
    }

    if (options.includeVesting) {
      rowData.push(
        row.vestedSlices !== undefined ? formatNumberForPDF(row.vestedSlices) : "-",
        row.unvestedSlices !== undefined ? formatNumberForPDF(row.unvestedSlices) : "-"
      );
    }

    return rowData;
  });

  // Add totals row
  const totalsRow: (string | number)[] = [
    "TOTAL",
    formatNumberForPDF(data.totalSlices),
    "100%",
  ];

  if (options.includeValuation && data.companyValuation) {
    totalsRow.push(formatCurrencyForPDF(data.companyValuation));
  }

  if (options.includeVesting) {
    const totalVested = data.summaryRows.reduce(
      (sum, r) => sum + (r.vestedSlices || 0),
      0
    );
    const totalUnvested = data.summaryRows.reduce(
      (sum, r) => sum + (r.unvestedSlices || 0),
      0
    );
    totalsRow.push(formatNumberForPDF(totalVested), formatNumberForPDF(totalUnvested));
  }

  summaryRows.push(totalsRow);

  autoTable(doc, {
    head: [summaryHeaders],
    body: summaryRows,
    startY: yPosition,
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    // Bold the last row (totals)
    didParseCell: function (data) {
      if (data.row.index === summaryRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235]; // gray-200
      }
    },
  });

  yPosition =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ||
    yPosition;
  yPosition += 15;

  // ========== SECTION 4: Contributions Breakdown ==========
  if (options.includeContributionsBreakdown && data.contributionsSections) {
    yPosition = checkPageBreak(doc, yPosition, 30);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Contributions Breakdown", MARGIN_LEFT, yPosition);
    yPosition += 10;

    for (const section of data.contributionsSections) {
      // Check if we need a new page for this contributor section
      yPosition = checkPageBreak(doc, yPosition, 40);

      // Contributor header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${section.contributorName} (${formatNumberForPDF(section.subtotalSlices)} slices)`,
        MARGIN_LEFT,
        yPosition
      );
      yPosition += 6;

      // Contributions table
      const contributionHeaders = ["Date", "Type", "Description", "Value", "Slices"];
      const contributionRows = section.contributions.map((c) => [
        c.date,
        c.type,
        truncateText(c.description, 30),
        c.formattedValue,
        formatNumberForPDF(c.slices),
      ]);

      autoTable(doc, {
        head: [contributionHeaders],
        body: contributionRows,
        startY: yPosition,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [107, 114, 128], // gray-500
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251], // gray-50
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 25 }, // Type
          2: { cellWidth: 50 }, // Description
          3: { cellWidth: 40 }, // Value
          4: { cellWidth: 25 }, // Slices
        },
      });

      yPosition =
        (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ||
        yPosition;
      yPosition += 10;
    }
  }

  // ========== SECTION 5: Vesting Projections ==========
  if (
    options.includeVesting &&
    data.vestingProjections &&
    data.vestingProjections.length > 0
  ) {
    yPosition = checkPageBreak(doc, yPosition, 40);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Vesting Projections", MARGIN_LEFT, yPosition);
    yPosition += 8;

    const vestingHeaders = ["Date", "Contributor", "Vested", "Unvested", "% Vested"];
    const vestingRows = data.vestingProjections.map((p) => [
      p.date,
      p.contributorName,
      formatNumberForPDF(p.vestedSlices),
      formatNumberForPDF(p.unvestedSlices),
      `${formatNumberForPDF(p.vestedPercentage, 1)}%`,
    ]);

    autoTable(doc, {
      head: [vestingHeaders],
      body: vestingRows,
      startY: yPosition,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [124, 58, 237], // violet-600
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
