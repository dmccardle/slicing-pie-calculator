"use client";

import { useState } from "react";
import { useSlicingPieContext } from "@/context/SlicingPieContext";
import { useFeatureFlagsContext } from "@/context/FeatureFlagsContext";
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Modal, Select, Toggle } from "@/components/ui";
import { ExportPanel } from "@/components/export";
import { ValuationConfig, ValuationHistory } from "@/components/valuation";
import type { Company, Contributor, Contribution } from "@/types/slicingPie";
import { formatSlices, formatCurrency, formatEquityPercentage } from "@/utils/slicingPie";
import { useAISettings } from "@/hooks/useAISettings";
import { AI_MODELS, type AIModel } from "@/types/ai";
import { testApiKey } from "@/services/claude";

interface SlicingPieExportData {
  version: string;
  exportedAt: string;
  company: Company;
  contributors: Contributor[];
  contributions: Contribution[];
}

function validateImportData(data: unknown): data is SlicingPieExportData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  // Check required fields
  if (!obj.version || typeof obj.version !== "string") return false;
  if (!obj.company || typeof obj.company !== "object") return false;
  if (!Array.isArray(obj.contributors)) return false;
  if (!Array.isArray(obj.contributions)) return false;

  // Validate company
  const company = obj.company as Record<string, unknown>;
  if (typeof company.name !== "string") return false;

  // Validate contributors structure
  for (const c of obj.contributors as Record<string, unknown>[]) {
    if (typeof c.id !== "string") return false;
    if (typeof c.name !== "string") return false;
    if (typeof c.hourlyRate !== "number") return false;
  }

  // Validate contributions structure
  for (const c of obj.contributions as Record<string, unknown>[]) {
    if (typeof c.id !== "string") return false;
    if (typeof c.contributorId !== "string") return false;
    if (typeof c.type !== "string") return false;
    if (typeof c.value !== "number") return false;
    if (typeof c.slices !== "number") return false;
  }

  return true;
}

export default function SettingsPage() {
  const {
    company,
    updateCompany,
    contributors,
    contributorsWithEquity,
    contributions,
    totalSlices,
    clearAllData,
    loadSampleData,
    hasSampleData,
    addContributor,
    addContribution,
    isLoading,
  } = useSlicingPieContext();

  const [showClearModal, setShowClearModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Feature Flags
  const { vestingEnabled, setVestingEnabled, valuationEnabled, setValuationEnabled } = useFeatureFlagsContext();

  // AI Settings
  const {
    apiKey,
    modelPreference,
    isConfigured: isAIConfigured,
    setModelPreference,
  } = useAISettings();

  const [isTestingKey, setIsTestingKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestApiKey = async () => {
    if (!apiKey) return;

    setIsTestingKey(true);
    setApiKeyTestResult(null);

    try {
      const result = await testApiKey(apiKey, modelPreference);
      setApiKeyTestResult({
        success: result.success,
        message: result.success ? "API key is valid!" : result.error || "Invalid API key",
      });
    } catch {
      setApiKeyTestResult({
        success: false,
        message: "Failed to test API key. Check your connection.",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const modelOptions = Object.entries(AI_MODELS).map(([value, { name, description }]) => ({
    value,
    label: `${name} - ${description}`,
  }));

  const handleClearData = () => {
    clearAllData();
    setShowClearModal(false);
  };

  const handleImport = (data: unknown) => {
    setImportError(null);
    setImportSuccess(false);

    if (!validateImportData(data)) {
      setImportError(
        "Invalid file format. Please ensure you are importing a valid Slicing Pie backup file."
      );
      return;
    }

    try {
      // Clear existing data first
      clearAllData();

      // Update company
      updateCompany(data.company);

      // Import contributors
      data.contributors.forEach((contributor) => {
        addContributor({
          name: contributor.name,
          email: contributor.email,
          hourlyRate: contributor.hourlyRate,
          active: contributor.active ?? true,
        });
      });

      // Import contributions
      data.contributions.forEach((contribution) => {
        addContribution({
          contributorId: contribution.contributorId,
          type: contribution.type,
          value: contribution.value,
          description: contribution.description,
          date: contribution.date,
          multiplier: contribution.multiplier,
          slices: contribution.slices,
        });
      });

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      setImportError("Failed to import data. Please try again.");
    }
  };

  // Prepare export data
  const exportData: SlicingPieExportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    company,
    contributors,
    contributions,
  };

  // Excel sheets for Slicing Pie
  const excelSheets = [
    {
      name: "Summary",
      data: [
        {
          "Company Name": company.name,
          "Total Contributors": contributors.length,
          "Total Contributions": contributions.length,
          "Total Slices": totalSlices,
          "Export Date": new Date().toLocaleDateString(),
        },
      ],
      columns: [
        { key: "Company Name", header: "Company Name", width: 25 },
        { key: "Total Contributors", header: "Total Contributors", width: 20 },
        { key: "Total Contributions", header: "Total Contributions", width: 20 },
        { key: "Total Slices", header: "Total Slices", width: 20 },
        { key: "Export Date", header: "Export Date", width: 20 },
      ],
    },
    {
      name: "Contributors",
      data: contributorsWithEquity.map((c) => ({
        Name: c.name,
        Email: c.email || "",
        "Hourly Rate": formatCurrency(c.hourlyRate),
        "Total Slices": c.totalSlices,
        "Equity %": formatEquityPercentage(c.equityPercentage),
        Status: c.active ? "Active" : "Inactive",
      })),
      columns: [
        { key: "Name", header: "Name", width: 25 },
        { key: "Email", header: "Email", width: 30 },
        { key: "Hourly Rate", header: "Hourly Rate", width: 15 },
        { key: "Total Slices", header: "Total Slices", width: 15 },
        { key: "Equity %", header: "Equity %", width: 15 },
        { key: "Status", header: "Status", width: 12 },
      ],
    },
    {
      name: "Contributions",
      data: contributions.map((c) => {
        const contributor = contributors.find((cont) => cont.id === c.contributorId);
        return {
          Date: c.date,
          Contributor: contributor?.name || "Unknown",
          Type: c.type,
          Value: c.value,
          Multiplier: c.multiplier,
          Slices: c.slices,
          Description: c.description || "",
        };
      }),
      columns: [
        { key: "Date", header: "Date", width: 15 },
        { key: "Contributor", header: "Contributor", width: 25 },
        { key: "Type", header: "Type", width: 12 },
        { key: "Value", header: "Value", width: 12 },
        { key: "Multiplier", header: "Multiplier", width: 12 },
        { key: "Slices", header: "Slices", width: 12 },
        { key: "Description", header: "Description", width: 30 },
      ],
    },
  ];

  // PDF tables
  const pdfTables = [
    {
      title: "Equity Summary",
      headers: ["Contributor", "Hourly Rate", "Total Slices", "Equity %"],
      rows: contributorsWithEquity.map((c) => [
        c.name,
        formatCurrency(c.hourlyRate),
        formatSlices(c.totalSlices),
        formatEquityPercentage(c.equityPercentage),
      ]),
    },
    {
      title: "Recent Contributions",
      headers: ["Date", "Contributor", "Type", "Value", "Slices"],
      rows: contributions.slice(0, 20).map((c) => {
        const contributor = contributors.find((cont) => cont.id === c.contributorId);
        return [
          c.date,
          contributor?.name || "Unknown",
          c.type,
          c.value.toString(),
          formatSlices(c.slices),
        ];
      }),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your company settings and data
        </p>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Company Settings</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Company Name"
            value={company.name}
            onChange={(e) => updateCompany({ name: e.target.value })}
            helperText="The name of your startup or company"
          />
          <Input
            label="Description"
            value={company.description || ""}
            onChange={(e) => updateCompany({ description: e.target.value })}
            helperText="A brief description of your company (optional)"
          />
        </CardBody>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">AI-Assisted Valuation</h2>
            {isAIConfigured ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Configured
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Not Configured
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-600">
            Enable AI-powered suggestions for valuing contributions. Claude will help you
            determine fair market values for ideas, relationships, and hourly rates.
          </p>

          {/* API Key Configuration */}
          {isAIConfigured ? (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-700">
                API key configured via environment variable.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-sm font-medium text-amber-800">
                API Key Required
              </p>
              <p className="text-sm text-amber-700">
                To enable AI features, add your Anthropic API key to <code className="bg-amber-100 px-1 rounded">.env.local</code>:
              </p>
              <pre className="bg-amber-100 p-2 rounded text-xs text-amber-900 overflow-x-auto">
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
              </pre>
              <p className="text-xs text-amber-600">
                Then restart the development server.
              </p>
            </div>
          )}

          {/* Test result */}
          {apiKeyTestResult && (
            <div
              className={`rounded-md p-3 text-sm ${
                apiKeyTestResult.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {apiKeyTestResult.message}
            </div>
          )}

          {/* Model Selection - only show when configured */}
          {isAIConfigured && (
            <>
              <Select
                label="AI Model"
                value={modelPreference}
                onChange={(e) => setModelPreference(e.target.value as AIModel)}
                options={modelOptions}
                helperText="Haiku is faster and cheaper, Sonnet is more capable"
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestApiKey}
                isLoading={isTestingKey}
              >
                Test Connection
              </Button>
            </>
          )}

          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              <strong>Privacy:</strong> When you use AI features, your contribution descriptions
              and contributor names are sent to Anthropic. No data is stored on external servers.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Vesting Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Vesting Features</h2>
            {vestingEnabled ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Enabled
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Disabled
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-600">
            Enable cliff and vesting tracking to monitor when contributors&apos; equity becomes fully vested.
            Configure start dates, cliff periods, and vesting schedules for each contributor.
          </p>

          <Toggle
            id="vesting-toggle"
            label="Enable Vesting Features"
            checked={vestingEnabled}
            onChange={setVestingEnabled}
            helperText="When enabled, you can set vesting schedules for contributors and view future equity projections"
          />

          {vestingEnabled && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                <strong>Features enabled:</strong> Contributor vesting fields, vesting status badges,
                and the Projections page for viewing future equity distribution.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Valuation Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Valuation Features</h2>
            {valuationEnabled ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Enabled
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Disabled
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-600">
            Enable company valuation features to convert equity percentages into approximate dollar values.
            Set a manual valuation or calculate one from business metrics.
          </p>

          <Toggle
            id="valuation-toggle"
            label="Enable Valuation Features"
            checked={valuationEnabled}
            onChange={setValuationEnabled}
            helperText="When enabled, you can configure company valuation and view equity values in dollar terms"
          />

          {valuationEnabled && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                <strong>Features enabled:</strong> Company valuation configuration and the Equity Values
                page showing contributor equity in dollar terms.
              </p>
            </div>
          )}

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-700">
              <strong>Disclaimer:</strong> Valuations shown are rough estimates for discussion purposes only.
              They are NOT official legal valuations and should not be used for legal, tax, or financial decisions.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Valuation Configuration - only shown when enabled */}
      {valuationEnabled && <ValuationConfig showHeader />}

      {/* Valuation History - only shown when enabled */}
      {valuationEnabled && <ValuationHistory showHeader maxItems={5} />}

      {/* Data Export/Import */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Data Export / Import
          </h2>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-gray-600">
            Export your equity data for backup or import previously exported data.
          </p>
          {importError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {importError}
            </div>
          )}
          {importSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Data imported successfully!
            </div>
          )}
          <ExportPanel
            jsonData={exportData}
            jsonFilename="slicing-pie-backup"
            excelSheets={excelSheets}
            excelFilename="slicing-pie-equity"
            pdfTitle={`${company.name} - Equity Report`}
            pdfTables={pdfTables}
            pdfFilename="slicing-pie-report"
            onImport={handleImport}
          />
        </CardBody>
      </Card>

      {/* Sample Data */}
      {hasSampleData ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Sample Data</h2>
          </CardHeader>
          <CardBody>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                Sample Data Active
              </span>
            </div>
            <p className="text-sm text-gray-600">
              You are currently viewing sample data. Clear it to start fresh with
              your own contributors and contributions.
            </p>
          </CardBody>
          <CardFooter>
            <Button variant="secondary" onClick={clearAllData}>
              Clear Sample Data
            </Button>
          </CardFooter>
        </Card>
      ) : contributors.length === 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Sample Data</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-gray-600">
              Load sample data to explore the Slicing Pie calculator with example
              contributors and contributions.
            </p>
          </CardBody>
          <CardFooter>
            <Button variant="secondary" onClick={loadSampleData}>
              Load Sample Data
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {/* Data Management */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Data Management
          </h2>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-gray-600">
            Clear all application data including contributors, contributions, and
            company settings. This action cannot be undone.
          </p>
        </CardBody>
        <CardFooter>
          <Button variant="danger" onClick={() => setShowClearModal(true)}>
            Clear All Data
          </Button>
        </CardFooter>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">About</h2>
        </CardHeader>
        <CardBody>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Version</dt>
              <dd className="text-gray-900">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contributors</dt>
              <dd className="text-gray-900">{contributors.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contributions</dt>
              <dd className="text-gray-900">{contributions.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Slices</dt>
              <dd className="text-gray-900">{formatSlices(totalSlices)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Storage</dt>
              <dd className="text-gray-900">localStorage</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently delete all your equity data including:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>{contributors.length} contributors</li>
            <li>{contributions.length} contributions</li>
            <li>{formatSlices(totalSlices)} total slices</li>
            <li>Company settings</li>
          </ul>
          <p className="text-sm font-medium text-red-600">
            This action cannot be undone. Consider exporting your data first.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
