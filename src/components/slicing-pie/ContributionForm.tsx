"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form/Input";
import { Select } from "@/components/ui/Form/Select";
import { Button } from "@/components/ui/Button";
import type { ContributionType, Contributor, Company } from "@/types/slicingPie";
import { MULTIPLIERS, calculateSlices, formatSlices } from "@/utils/slicingPie";
import { SuggestValueButton, AIChatModal } from "@/components/ai";
import type { AISuggestion, ValuationContext } from "@/types/ai";
import { useAISettings } from "@/hooks/useAISettings";

interface ContributionFormData {
  contributorId: string;
  type: ContributionType;
  value: number;
  description: string;
  date: string;
}

interface ContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributionFormData & { multiplier: number; slices: number }) => void;
  contributors: Contributor[];
  company?: Company;
  isSubmitting?: boolean;
}

const CONTRIBUTION_TYPES: { value: ContributionType; label: string; description: string }[] = [
  { value: "time", label: "Time", description: "Hours worked x hourly rate x 2" },
  { value: "cash", label: "Cash", description: "Amount x 4" },
  { value: "non-cash", label: "Non-Cash", description: "Fair market value x 2" },
  { value: "idea", label: "Idea", description: "Negotiated value x 1" },
  { value: "relationship", label: "Relationship", description: "Negotiated value x 1" },
];

const INITIAL_FORM_DATA: ContributionFormData = {
  contributorId: "",
  type: "time",
  value: 0,
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export function ContributionForm({
  isOpen,
  onClose,
  onSubmit,
  contributors,
  company,
  isSubmitting = false,
}: ContributionFormProps) {
  const [formData, setFormData] = useState<ContributionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ContributionFormData, string>>>({});
  const [showAIChat, setShowAIChat] = useState(false);
  const { isConfigured: isAIConfigured } = useAISettings();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM_DATA,
        date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
    }
  }, [isOpen]);

  const selectedContributor = useMemo(() => {
    return contributors.find((c) => c.id === formData.contributorId);
  }, [contributors, formData.contributorId]);

  const slicePreview = useMemo(() => {
    if (!formData.value || formData.value <= 0) {
      return { slices: 0, multiplier: MULTIPLIERS[formData.type] };
    }
    const multiplier = MULTIPLIERS[formData.type];
    const slices = calculateSlices(
      formData.type,
      formData.value,
      selectedContributor?.hourlyRate
    );
    return { slices, multiplier };
  }, [formData.type, formData.value, selectedContributor?.hourlyRate]);

  // Context for AI valuation
  const valuationContext: ValuationContext | null = useMemo(() => {
    if (!selectedContributor) return null;
    return {
      contributorName: selectedContributor.name,
      contributorHourlyRate: selectedContributor.hourlyRate,
      companyName: company?.name || "My Startup",
      companyDescription: company?.description,
    };
  }, [selectedContributor, company]);

  const handleAISuggestion = (suggestion: AISuggestion) => {
    setFormData((prev) => ({
      ...prev,
      type: suggestion.type,
      value: suggestion.value,
    }));
  };

  const getValueLabel = () => {
    switch (formData.type) {
      case "time":
        return "Hours Worked";
      case "cash":
        return "Amount ($)";
      case "non-cash":
        return "Fair Market Value ($)";
      case "idea":
      case "relationship":
        return "Negotiated Value (Slices)";
      default:
        return "Value";
    }
  };

  const getValueHelperText = () => {
    switch (formData.type) {
      case "time":
        return selectedContributor
          ? `${formData.value || 0} hrs x $${selectedContributor.hourlyRate}/hr x ${slicePreview.multiplier} = ${formatSlices(slicePreview.slices)} slices`
          : "Select a contributor first to calculate slices";
      case "cash":
        return `$${formData.value || 0} x ${slicePreview.multiplier} = ${formatSlices(slicePreview.slices)} slices`;
      case "non-cash":
        return `$${formData.value || 0} x ${slicePreview.multiplier} = ${formatSlices(slicePreview.slices)} slices`;
      case "idea":
      case "relationship":
        return `${formData.value || 0} x ${slicePreview.multiplier} = ${formatSlices(slicePreview.slices)} slices`;
      default:
        return "";
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContributionFormData, string>> = {};

    if (!formData.contributorId) {
      newErrors.contributorId = "Please select a contributor";
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        multiplier: slicePreview.multiplier,
        slices: slicePreview.slices,
      });
    }
  };

  const handleChange = (field: keyof ContributionFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const contributorOptions = contributors.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const typeOptions = CONTRIBUTION_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Contribution">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Contributor"
          options={contributorOptions}
          placeholder="Select contributor"
          value={formData.contributorId}
          onChange={(e) => handleChange("contributorId", e.target.value)}
          error={errors.contributorId}
        />

        <Select
          label="Contribution Type"
          options={typeOptions}
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value as ContributionType)}
        />

        <Input
          label={getValueLabel()}
          type="number"
          min="0"
          step={formData.type === "time" ? "0.5" : "0.01"}
          placeholder="0"
          value={formData.value || ""}
          onChange={(e) => handleChange("value", parseFloat(e.target.value) || 0)}
          error={errors.value}
          helperText={getValueHelperText()}
        />

        {/* Slice Preview */}
        {formData.value > 0 && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Slices to be awarded:
              </span>
              <span className="text-xl font-bold text-blue-600">
                {formatSlices(slicePreview.slices)}
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-700">
              Multiplier: {slicePreview.multiplier}x
            </p>
          </div>
        )}

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
        />

        <Input
          label="Description"
          placeholder="Brief description of the contribution"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          helperText="Optional - helps track contribution details"
        />

        {/* AI Suggestion Tools */}
        {isAIConfigured && valuationContext && (
          <SuggestValueButton
            description={formData.description || `${formData.type} contribution`}
            context={valuationContext}
            onSuggestion={handleAISuggestion}
            onOpenChat={() => setShowAIChat(true)}
            disabled={!selectedContributor}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Log Contribution
          </Button>
        </div>
      </form>

      {/* AI Chat Modal */}
      {valuationContext && (
        <AIChatModal
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          context={valuationContext}
          onApplySuggestion={handleAISuggestion}
          initialMessage={formData.description}
        />
      )}
    </Modal>
  );
}

export default ContributionForm;
