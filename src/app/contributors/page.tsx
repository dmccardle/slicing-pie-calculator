"use client";

import React, { useState, useMemo } from "react";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ContributorCard, ContributorForm } from "@/components/slicing-pie";
import type { Contributor, ContributionType } from "@/types/slicingPie";
import { calculateSlices, MULTIPLIERS } from "@/utils/slicingPie";
import { UsersIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function ContributorsPage() {
  const {
    contributorsWithEquity,
    contributions,
    company,
    addContributor,
    updateContributor,
    removeContributor,
    addContribution,
    getContributorById,
    isLoading,
  } = useSlicingPieContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Get recent contributions for the contributor being edited
  const recentContributions = useMemo(() => {
    if (!editingContributor) return [];
    return contributions
      .filter((c) => c.contributorId === editingContributor.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [editingContributor, contributions]);

  const handleAdd = () => {
    setEditingContributor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    const contributor = getContributorById(id);
    if (contributor) {
      setEditingContributor(contributor);
      setIsFormOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      removeContributor(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleFormSubmit = (data: {
    name: string;
    email: string;
    hourlyRate: number;
    active: boolean;
  }) => {
    setIsSubmitting(true);

    try {
      if (editingContributor) {
        updateContributor(editingContributor.id, data);
      } else {
        addContributor(data);
      }
      setIsFormOpen(false);
      setEditingContributor(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingContributor(null);
  };

  const handleQuickAddContribution = (data: {
    type: ContributionType;
    value: number;
    description: string;
    date: string;
  }) => {
    if (!editingContributor) return;

    const slices = calculateSlices(data.type, data.value, editingContributor.hourlyRate);

    addContribution({
      contributorId: editingContributor.id,
      type: data.type,
      value: data.value,
      description: data.description,
      date: data.date,
      multiplier: MULTIPLIERS[data.type],
      slices,
    });
  };

  const contributorToDelete = deleteConfirmId
    ? getContributorById(deleteConfirmId)
    : null;

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
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <UsersIcon className="h-7 w-7 text-blue-600" />
            Contributors
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage team members and their hourly rates
          </p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon className="h-5 w-5" />
          Add Contributor
        </Button>
      </div>

      {contributorsWithEquity.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No contributors yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Add your first team member to start tracking equity contributions.
          </p>
          <Button className="mt-4" onClick={handleAdd}>
            <UserPlusIcon className="h-5 w-5" />
            Add First Contributor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contributorsWithEquity.map((contributor) => (
            <ContributorCard
              key={contributor.id}
              contributor={contributor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <ContributorForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        contributor={editingContributor}
        isSubmitting={isSubmitting}
        onAddContribution={handleQuickAddContribution}
        recentContributions={recentContributions}
        company={company}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Contributor"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{contributorToDelete?.name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This will also remove all their contributions from equity calculations.
            You can restore them later from Deleted Items.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Contributor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
