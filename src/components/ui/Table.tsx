"use client";

import React, { useState, useMemo } from "react";
import type { TableColumn, SortDirection } from "@/types";

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  emptyMessage = "No data available",
  className = "",
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      // Cycle through: asc -> desc -> null
      setSortDirection((prev) => {
        if (prev === "asc") return "desc";
        if (prev === "desc") return null;
        return "asc";
      });
      if (sortDirection === "desc") {
        setSortColumn(null);
      }
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortColumn !== column.key) {
      return (
        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg className="ml-1 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`
                  px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500
                  ${column.sortable ? "cursor-pointer select-none hover:bg-gray-100" : "cursor-default"}
                `}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  {column.label}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={`${item.id}-${String(column.key)}`}
                  className="whitespace-nowrap px-4 py-3 text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
