"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Form/Checkbox";
import type { Contributor, Contribution, ContributionType, Company, VestingConfig } from "@/types/slicingPie";
import { CONTRIBUTION_TYPE_LABELS } from "@/types/slicingPie";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { calculateSlices, MULTIPLIERS, formatSlices, formatContributionValue, formatCurrency } from "@/utils/slicingPie";
import { SuggestValueButton, AIChatModal } from "@/components/ai";
import type { AISuggestion, ValuationContext } from "@/types/ai";
import { useAISettings } from "@/hooks/useAISettings";

interface ContributorFormData {
  name: string;
  email: string;
  hourlyRate: number;
  active: boolean;
  vesting?: VestingConfig;
}

interface QuickContributionData {
  type: ContributionType;
  value: number;
  description: string;
  date: string;
}

interface ContributorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributorFormData) => void;
  contributor?: Contributor | null;
  isSubmitting?: boolean;
  onAddContribution?: (data: QuickContributionData) => void;
  recentContributions?: Contribution[];
  company?: Company;
}

const INITIAL_FORM_DATA: ContributorFormData = {
  name: "",
  email: "",
  hourlyRate: 0,
  active: true,
};

const INITIAL_CONTRIBUTION_DATA: QuickContributionData = {
  type: "time",
  value: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
};

const CONTRIBUTION_TYPE_OPTIONS = [
  { value: "time", label: "Time (Unpaid)" },
  { value: "cash", label: "Cash Investment" },
  { value: "non-cash", label: "Non-Cash (Equipment)" },
  { value: "idea", label: "Idea / IP" },
  { value: "relationship", label: "Relationship / Sales" },
];

export function ContributorForm({
  isOpen,
  onClose,
  onSubmit,
  contributor,
  isSubmitting = false,
  onAddContribution,
  recentContributions = [],
  company,
}: ContributorFormProps) {
  const [formData, setFormData] = useState<ContributorFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ContributorFormData, string>>>({});
  const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);
  const [contributionData, setContributionData] = useState<QuickContributionData>(INITIAL_CONTRIBUTION_DATA);
  const [showAIChat, setShowAIChat] = useState(false);
  const { isConfigured: isAIConfigured } = useAISettings();
  const { vestingEnabled } = useFeatureFlagsContext();

  // Vesting state
  const [vestingData, setVestingData] = useState<VestingConfig | null>(null);

  const isEditing = !!contributor;

  useEffect(() => {
    if (contributor) {
      setFormData({
        name: contributor.name,
        email: contributor.email || "",
        hourlyRate: contributor.hourlyRate,
        active: contributor.active,
      });
      // Load vesting data if exists
      setVestingData(contributor.vesting || null);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setVestingData(null);
    }
    setErrors({});
    // Reset quick-add form when modal opens/closes
    setContributionData({
      ...INITIAL_CONTRIBUTION_DATA,
      date: new Date().toISOString().split("T")[0],
    });
    setIsQuickAddExpanded(false);
  }, [contributor, isOpen]);

  // Calculate slice preview for quick-add
  const slicePreview = useMemo(() => {
    if (!contributionData.value || contributionData.value <= 0) {
      return { slices: 0, multiplier: MULTIPLIERS[contributionData.type] };
    }
    // Use current form hourlyRate (even if not yet saved)
    const hourlyRate = formData.hourlyRate;
    const multiplier = MULTIPLIERS[contributionData.type];
    const slices = calculateSlices(contributionData.type, contributionData.value, hourlyRate);
    return { slices, multiplier };
  }, [contributionData.type, contributionData.value, formData.hourlyRate]);

  // Context for AI valuation in quick-add
  const valuationContext: ValuationContext | null = useMemo(() => {
    if (!contributor) return null;
    return {
      contributorName: formData.name || contributor.name,
      contributorHourlyRate: formData.hourlyRate,
      companyName: company?.name || "My Startup",
      companyDescription: company?.description,
    };
  }, [contributor, formData.name, formData.hourlyRate, company]);

  const handleAISuggestion = (suggestion: AISuggestion) => {
    setContributionData((prev) => ({
      ...prev,
      type: suggestion.type,
      value: suggestion.value,
    }));
  };

  // Get value input label based on contribution type
  const getValueLabel = (type: ContributionType): string => {
    switch (type) {
      case "time":
        return "Hours Worked";
      case "cash":
      case "non-cash":
        return "Amount ($)";
      default:
        return "Negotiated Value (Slices)";
    }
  };

  const handleAddContribution = () => {
    if (!onAddContribution || contributionData.value <= 0) return;
    onAddContribution(contributionData);
    // Reset form for next entry
    setContributionData({
      ...INITIAL_CONTRIBUTION_DATA,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContributorFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.hourlyRate < 0) {
      newErrors.hourlyRate = "Hourly rate cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Include vesting data in submission
      const dataToSubmit: ContributorFormData = {
        ...formData,
        vesting: vestingData || undefined,
      };
      onSubmit(dataToSubmit);
    }
  };

  const handleChange = (field: keyof ContributorFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Contributor" : "Add Contributor"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="Enter contributor name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="contributor@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          helperText="Optional - for notifications"
        />

        <Input
          label="Hourly Rate ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={formData.hourlyRate}
          onChange={(e) => handleChange("hourlyRate", parseFloat(e.target.value) || 0)}
          error={errors.hourlyRate}
          helperText="Used to calculate time contribution slices (hours x rate x 2)"
        />

        <Checkbox
          label="Active contributor"
          checked={formData.active}
          onChange={(e) => handleChange("active", e.target.checked)}
        />

        {/* Vesting Configuration - Only when vesting is enabled */}
        {vestingEnabled && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Vesting Schedule</h3>
              {!vestingData && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setVestingData({
                      startDate: new Date().toISOString().split("T")[0],
                      cliffMonths: 12,
                      vestingMonths: 48,
                    })
                  }
                >
                  + Add Vesting
                </Button>
              )}
              {vestingData && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setVestingData(null)}
                >
                  Remove Vesting
                </Button>
              )}
            </div>

            {vestingData && (
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={vestingData.startDate}
                  onChange={(e) =>
                    setVestingData((prev) =>
                      prev ? { ...prev, startDate: e.target.value } : null
                    )
                  }
                  helperText="When the contributor started (vesting begins from this date)"
                />

                <Input
                  label="Cliff Period (months)"
                  type="number"
                  min="0"
                  max="24"
                  value={vestingData.cliffMonths}
                  onChange={(e) =>
                    setVestingData((prev) =>
                      prev
                        ? { ...prev, cliffMonths: parseInt(e.target.value) || 0 }
                        : null
                    )
                  }
                  helperText="Months before any equity vests (typically 12 months)"
                />

                <Input
                  label="Vesting Period (months)"
                  type="number"
                  min="1"
                  max="60"
                  value={vestingData.vestingMonths}
                  onChange={(e) =>
                    setVestingData((prev) =>
                      prev
                        ? { ...prev, vestingMonths: parseInt(e.target.value) || 12 }
                        : null
                    )
                  }
                  helperText="Total months for full vesting (typically 48 months / 4 years)"
                />

                {/* Vesting Preview */}
                <div className="rounded-md bg-blue-50 p-3 text-sm">
                  <p className="text-blue-700">
                    <strong>Schedule:</strong> {vestingData.cliffMonths}-month cliff, then linear
                    vesting over {vestingData.vestingMonths} months total
                  </p>
                  {vestingData.startDate && (
                    <p className="text-blue-600 mt-1">
                      Cliff ends:{" "}
                      {new Date(
                        new Date(vestingData.startDate).setMonth(
                          new Date(vestingData.startDate).getMonth() + vestingData.cliffMonths
                        )
                      ).toLocaleDateString()}
                      {" | "}
                      Fully vested:{" "}
                      {new Date(
                        new Date(vestingData.startDate).setMonth(
                          new Date(vestingData.startDate).getMonth() + vestingData.vestingMonths
                        )
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!vestingData && (
              <p className="text-xs text-gray-500">
                No vesting schedule. Contributor is treated as 100% vested.
              </p>
            )}
          </div>
        )}

        {/* Quick Add Contribution Section - Only in edit mode */}
        {isEditing && onAddContribution && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            {/* Collapsible Header */}
            <button
              type="button"
              onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-gray-900">
                Quick Add Contribution
              </span>
              <svg
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  isQuickAddExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Collapsed summary */}
            {!isQuickAddExpanded && recentContributions.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {recentContributions.length} recent contribution{recentContributions.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Expanded Content */}
            {isQuickAddExpanded && (
              <div className="mt-4 space-y-4">
                {/* Contribution Form */}
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <Select
                    label="Type"
                    value={contributionData.type}
                    onChange={(e) =>
                      setContributionData((prev) => ({
                        ...prev,
                        type: e.target.value as ContributionType,
                      }))
                    }
                    options={CONTRIBUTION_TYPE_OPTIONS}
                  />

                  <Input
                    label={getValueLabel(contributionData.type)}
                    type="number"
                    min="0"
                    step={contributionData.type === "time" ? "0.5" : "1"}
                    placeholder="0"
                    value={contributionData.value || ""}
                    onChange={(e) =>
                      setContributionData((prev) => ({
                        ...prev,
                        value: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />

                  <Input
                    label="Description (optional)"
                    placeholder="Brief description"
                    value={contributionData.description}
                    onChange={(e) =>
                      setContributionData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Date"
                    type="date"
                    value={contributionData.date}
                    onChange={(e) =>
                      setContributionData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />

                  {/* Slice Preview */}
                  <div className="rounded-md bg-blue-50 p-3">
                    <p className="text-xs text-gray-600">Slice Preview</p>
                    <p className="text-sm font-medium text-blue-700">
                      {contributionData.type === "time" ? (
                        <>
                          {contributionData.value || 0} hrs × {formatCurrency(formData.hourlyRate)}/hr × {slicePreview.multiplier} ={" "}
                          <span className="text-blue-900">{formatSlices(slicePreview.slices)} slices</span>
                        </>
                      ) : contributionData.type === "idea" || contributionData.type === "relationship" ? (
                        <>
                          {formatSlices(contributionData.value || 0)} slices (negotiated)
                        </>
                      ) : (
                        <>
                          {formatCurrency(contributionData.value || 0)} × {slicePreview.multiplier} ={" "}
                          <span className="text-blue-900">{formatSlices(slicePreview.slices)} slices</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* AI Suggestion Tools */}
                  {isAIConfigured && valuationContext && (
                    <SuggestValueButton
                      description={contributionData.description || `${contributionData.type} contribution`}
                      context={valuationContext}
                      onSuggestion={handleAISuggestion}
                      onOpenChat={() => setShowAIChat(true)}
                    />
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleAddContribution}
                    disabled={contributionData.value <= 0}
                  >
                    + Add Contribution
                  </Button>
                </div>

                {/* Recent Contributions */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Recent Contributions
                  </h4>
                  {recentContributions.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No contributions yet</p>
                  ) : (
                    <div className="space-y-1">
                      {recentContributions.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-gray-500">
                            {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-gray-700 capitalize">
                            {CONTRIBUTION_TYPE_LABELS[c.type].split(" ")[0]}
                          </span>
                          <span className="text-gray-600">
                            {formatContributionValue(c.type, c.value)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatSlices(c.slices)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Add Contributor"}
          </Button>
        </div>
      </form>

      {/* AI Chat Modal for quick-add */}
      {valuationContext && (
        <AIChatModal
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          context={valuationContext}
          onApplySuggestion={handleAISuggestion}
          initialMessage={contributionData.description}
        />
      )}
    </Modal>
  );
}

export default ContributorForm;
