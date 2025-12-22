"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Form/Checkbox";
import type { Contributor } from "@/types/slicingPie";

interface ContributorFormData {
  name: string;
  email: string;
  hourlyRate: number;
  active: boolean;
}

interface ContributorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributorFormData) => void;
  contributor?: Contributor | null;
  isSubmitting?: boolean;
}

const INITIAL_FORM_DATA: ContributorFormData = {
  name: "",
  email: "",
  hourlyRate: 0,
  active: true,
};

export function ContributorForm({
  isOpen,
  onClose,
  onSubmit,
  contributor,
  isSubmitting = false,
}: ContributorFormProps) {
  const [formData, setFormData] = useState<ContributorFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ContributorFormData, string>>>({});

  const isEditing = !!contributor;

  useEffect(() => {
    if (contributor) {
      setFormData({
        name: contributor.name,
        email: contributor.email || "",
        hourlyRate: contributor.hourlyRate,
        active: contributor.active,
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [contributor, isOpen]);

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
      onSubmit(formData);
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Add Contributor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ContributorForm;
