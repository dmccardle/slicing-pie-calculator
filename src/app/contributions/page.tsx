"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useSlicingPie, type ContributionFilters, type ContributionSort } from "@/hooks/useSlicingPie";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Form/Select";
import { Card, CardBody } from "@/components/ui/Card";
import { ContributionForm, ContributionRow } from "@/components/slicing-pie";
import type { ContributionType } from "@/types/slicingPie";
import { formatSlices } from "@/utils/slicingPie";

type SortField = "date" | "contributorId" | "type" | "value" | "slices";
type SortDirection = "asc" | "desc";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "time", label: "Time" },
  { value: "cash", label: "Cash" },
  { value: "non-cash", label: "Non-Cash" },
  { value: "idea", label: "Idea" },
  { value: "relationship", label: "Relationship" },
];

export default function ContributionsPage() {
  const {
    contributors,
    contributions,
    company,
    addContribution,
    getContributorById,
    isLoading,
  } = useSlicingPieContext();

  const { filterContributions, sortContributions } = useSlicingPie(contributors, contributions);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filterContributor, setFilterContributor] = useState("");
  const [filterType, setFilterType] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: {
    contributorId: string;
    type: ContributionType;
    value: number;
    description: string;
    date: string;
    multiplier: number;
    slices: number;
  }) => {
    setIsSubmitting(true);

    try {
      addContribution({
        contributorId: data.contributorId,
        type: data.type,
        value: data.value,
        description: data.description,
        date: data.date,
        multiplier: data.multiplier,
        slices: data.slices,
      });
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Apply filters
  const filters: ContributionFilters = useMemo(() => ({
    contributorId: filterContributor || undefined,
    type: (filterType as ContributionType) || undefined,
  }), [filterContributor, filterType]);

  const filteredContributions = useMemo(() => {
    return filterContributions(filters);
  }, [filterContributions, filters]);

  // Apply sorting
  const sortedContributions = useMemo(() => {
    const sort: ContributionSort = { field: sortField, direction: sortDirection };
    return sortContributions(filteredContributions, sort);
  }, [sortContributions, filteredContributions, sortField, sortDirection]);

  // Calculate running total for filtered contributions
  const filteredSlicesTotal = useMemo(() => {
    return filteredContributions.reduce((sum, c) => sum + c.slices, 0);
  }, [filteredContributions]);

  // Contributor options for filter
  const contributorOptions = [
    { value: "", label: "All Contributors" },
    ...contributors.map((c) => ({ value: c.id, label: c.name })),
  ];

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // Sortable header
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center">
        {children}
        <SortIndicator field={field} />
      </span>
    </th>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Log and track equity contributions
          </p>
        </div>
        <Button onClick={handleAdd} disabled={contributors.length === 0}>
          Add Contribution
        </Button>
      </div>

      {contributors.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Add Contributors First
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You need to add contributors before you can log contributions.
            </p>
            <Link href="/contributors">
              <Button className="mt-4">Go to Contributors</Button>
            </Link>
          </CardBody>
        </Card>
      ) : contributions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No contributions yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Start logging contributions to track equity distribution.
          </p>
          <Button className="mt-4" onClick={handleAdd}>
            Log First Contribution
          </Button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardBody>
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[200px] flex-1">
                  <Select
                    label="Filter by Contributor"
                    options={contributorOptions}
                    value={filterContributor}
                    onChange={(e) => setFilterContributor(e.target.value)}
                  />
                </div>
                <div className="min-w-[200px] flex-1">
                  <Select
                    label="Filter by Type"
                    options={TYPE_OPTIONS}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Running Total */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
            <span className="text-sm font-medium text-blue-900">
              {filteredContributions.length === contributions.length
                ? `Total: ${contributions.length} contributions`
                : `Showing ${filteredContributions.length} of ${contributions.length} contributions`}
            </span>
            <span className="text-lg font-bold text-blue-600">
              {formatSlices(filteredSlicesTotal)} slices
            </span>
          </div>

          {/* Contributions Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader field="date">Date</SortableHeader>
                    <SortableHeader field="contributorId">Contributor</SortableHeader>
                    <SortableHeader field="type">Type</SortableHeader>
                    <SortableHeader field="value">Value</SortableHeader>
                    <th
                      className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("slices")}
                    >
                      <span className="flex items-center justify-end">
                        Slices
                        <SortIndicator field="slices" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedContributions.map((contribution) => {
                    const contributor = getContributorById(contribution.contributorId);
                    return (
                      <ContributionRow
                        key={contribution.id}
                        contribution={contribution}
                        contributorName={contributor?.name || "Unknown"}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Add Contribution Form Modal */}
      <ContributionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        contributors={contributors}
        company={company}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
