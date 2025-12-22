/**
 * Export utilities for JSON, Excel, and PDF
 */

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
